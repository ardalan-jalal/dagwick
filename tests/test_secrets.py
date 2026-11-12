from __future__ import annotations

from textwrap import dedent

import pytest
from conftest import DAGS

from dagwick import Context
from dagwick.checks._secrets import find_secrets, is_placeholder, is_secret_name
from dagwick.checks._source import parse
from dagwick.core import score_dag

FAKE = "Zq" + "8x" * 6
AWS_KEY_ID = "AK" + "IA" + "Q" * 16
PEM = "-----BEGIN " + "RSA PRIVATE KEY-----"
GITHUB = "gh" + "p_" + "a1" * 18
SLACK = "xo" + "xb-" + "1234567890-abcdefghij"
SLACK_HOOK = "https://hooks.slack.com/" + "services/" + "T0000/B0000/" + "c" * 24
GOOGLE = "AI" + "za" + "S" * 35


def secrets(source: str) -> list[tuple[int, str]]:
    return find_secrets(parse(dedent(source)))


def check(dag, source):
    report = score_dag(dag, Context(source=dedent(source)))
    return next(c for c in report["checks"] if c["id"] == "hardcoded_secrets")


@pytest.mark.parametrize(
    "name",
    [
        "password",
        "db_password",
        "DB_PASSWORD",
        "dbPassword",
        "passwd",
        "api_key",
        "apiKey",
        "aws_secret_access_key",
        "client_secret",
        "access_token",
        "private_key",
        "credentials",
    ],
)
def test_secret_names(name):
    assert is_secret_name(name)


@pytest.mark.parametrize(
    "name",
    [
        "s3_key",
        "partition_key",
        "password_conn_id",
        "secret_name",
        "token_url",
        "author",
        "auth_method",
        "tokenizer",
        "key",
    ],
)
def test_names_that_only_mention_a_secret_are_not_secrets(name):
    assert not is_secret_name(name)


@pytest.mark.parametrize(
    "value",
    [
        "",
        "abc",
        "changeme",
        "CHANGEME",
        "********",
        "<from-infisical>",
        "{{ conn.db.password }}",
        "${DB_PASSWORD}",
        "{password}",
        "your-password",
        "the db password",
        "__dbt_new_data_",
        "slack_alerts",
    ],
)
def test_placeholders(value):
    assert is_placeholder(value)


def test_real_looking_value_is_not_a_placeholder():
    assert not is_placeholder(FAKE)


def test_assignments_keywords_dicts_and_attributes_are_found():
    found = secrets(
        f"""
        DB_PASSWORD = "{FAKE}"
        token: str = "{FAKE}"
        default_args = {{"api_key": "{FAKE}"}}
        hook = Hook(client_secret="{FAKE}")
        config.private_key = "{FAKE}"
        env["ACCESS_TOKEN"] = "{FAKE}"
        """
    )
    assert found == [
        (2, 'value assigned to "DB_PASSWORD"'),
        (3, 'value assigned to "token"'),
        (4, 'value assigned to "api_key"'),
        (5, 'value assigned to "client_secret"'),
        (6, 'value assigned to "private_key"'),
        (7, 'value assigned to "ACCESS_TOKEN"'),
    ]


def test_safe_patterns_are_not_reported():
    assert (
        secrets(
            """
        s3_key = "raw/2026/11/09/file.csv"
        password_conn_id = "warehouse_default"
        secret_name = "airflow-db"
        password = "{{ conn.warehouse.password }}"
        token = Variable.get("slack_token")
        api_key = os.environ["API_KEY"]
        password = ""
        """
        )
        == []
    )


@pytest.mark.parametrize(
    ("value", "kind"),
    [
        (AWS_KEY_ID, "AWS access key id"),
        (PEM, "private key"),
        (GITHUB, "GitHub token"),
        (SLACK, "Slack token"),
        (SLACK_HOOK, "Slack webhook URL"),
        (GOOGLE, "Google API key"),
    ],
)
def test_known_credential_formats_are_found_anywhere(value, kind):
    assert secrets(f'notify(target="{value}")\n') == [(1, kind)]


def test_connection_uri_with_a_password_is_found():
    uri = "postgresql://loader:" + FAKE + "@db.internal:5432/warehouse"
    assert secrets(f'URI = "{uri}"\n') == [(1, "password in a connection URI")]


@pytest.mark.parametrize(
    "uri",
    [
        "postgresql://user:pass@localhost/db",
        "postgresql://loader@db.internal/warehouse",
        "https://example.com/path",
    ],
)
def test_connection_uris_without_a_real_password_are_ignored(uri):
    assert secrets(f'URI = "{uri}"\n') == []


def test_check_fails_names_lines_and_kinds_but_never_the_value(shining):
    source = f"""
    from airflow.sdk import DAG
    PASSWORD = "{FAKE}"
    KEY_ID = "{AWS_KEY_ID}"
    """
    result = check(shining, source)
    assert result["status"] == "fail"
    assert result["items"] == ['line 3: value assigned to "PASSWORD"', "line 4: AWS access key id"]
    assert result["category"] == "security"
    shown = repr(result)
    assert FAKE not in shown and AWS_KEY_ID not in shown


def test_check_passes_on_the_demo_dags(shining):
    for path in DAGS.glob("*.py"):
        assert check(shining, path.read_text())["status"] == "pass", path.name


@pytest.mark.parametrize("source", [None, "", "def broken(:\n"])
def test_check_skips_without_usable_source(shining, source):
    report = score_dag(shining, Context(source=source))
    result = next(c for c in report["checks"] if c["id"] == "hardcoded_secrets")
    assert result["status"] == "skip"


def test_secrets_check_cannot_be_acknowledged(shining):
    source = f'# dagwick: ack hardcoded_secrets -- it is only dev\nPASSWORD = "{FAKE}"\n'
    assert check(shining, source)["status"] == "fail"


def test_a_dict_key_that_is_not_a_plain_name_is_not_echoed():
    # The key itself could hold a credential; the finding must not repeat it.
    found = secrets(
        f"""
        conf = {{"postgres://u:hunter2@db/x?password": "{FAKE}"}}
        """
    )
    assert (2, "value assigned to a secret-named key") in found
    assert "hunter2" not in str(found)


def test_a_connection_uri_after_an_underscore_is_found():
    uri = "my_postgresql://loader:" + FAKE + "@db.internal/warehouse"
    assert secrets(f'URI = "{uri}"\n') == [(1, "password in a connection URI")]


@pytest.mark.parametrize("text", ["a." * 50_000, "a" * 100_000 + "://", "a://" + "b:" * 50_000])
def test_crafted_strings_cannot_stall_the_uri_scan(text):
    # The old pattern took seconds (quadratic time) on "a.a.a..." and similar strings,
    # which a DAG author could commit to stall the api-server's scoring.
    import time

    start = time.perf_counter()
    secrets(f'X = "{text}"\n')
    assert time.perf_counter() - start < 1.0

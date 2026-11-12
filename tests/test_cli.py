from __future__ import annotations

import io
import json
from textwrap import dedent

import pytest
from conftest import DAGS

from dagwick.cli import BELOW_GRADE, LOAD_ERROR, OK, below, main


def run(*args):
    out = io.StringIO()
    code = main(list(args), out=out)
    return code, out.getvalue()


def checks(report):
    return {c["id"]: c for c in report["checks"]}


@pytest.mark.parametrize(
    ("grade", "minimum", "result"),
    [("A", "C", False), ("C", "C", False), ("D", "C", True), ("F", "A", True), ("F", None, False)],
)
def test_below(grade, minimum, result):
    assert below(grade, minimum) is result


def test_folder_report_and_exit_code_follow_the_minimum_grade():
    code, out = run("check", str(DAGS), "--min-grade", "c")
    assert code == BELOW_GRADE
    assert "DemoLegacyJob" in out and "<- below C" in out
    assert out.strip().splitlines()[-1].endswith("below grade C")

    code, out = run("check", str(DAGS))
    assert code == OK
    assert "below" not in out.strip().splitlines()[-1]


def test_single_file_that_meets_the_grade():
    code, out = run("check", str(DAGS / "demo_shining_pipeline.py"), "--min-grade", "A")
    assert code == OK
    assert out.splitlines()[0].startswith("A  100.0  demo_shining_pipeline")
    assert out.strip().endswith("1 DAG checked, 0 below grade A")


def test_json_report_includes_file_and_source_based_checks():
    code, out = run("check", str(DAGS / "demo_shining_pipeline.py"), "--json")
    assert code == OK
    data = json.loads(out)
    (report,) = data["dags"]
    assert data["import_errors"] == {}
    assert report["file"].endswith("demo_shining_pipeline.py")
    c = checks(report)
    assert c["parse_time"]["status"] == "pass"
    assert c["parse_time_variables"]["status"] == "pass"
    assert c["hardcoded_secrets"]["status"] == "pass"
    assert c["file_name"]["status"] == "pass"


def test_import_errors_are_reported_and_exit_with_2(tmp_path):
    (tmp_path / "broken_dag.py").write_text(
        "from airflow.sdk import DAG\nraise RuntimeError('boom')\n"
    )
    code, out = run("check", str(tmp_path))
    assert code == LOAD_ERROR
    assert "ERROR" in out and "broken_dag.py" in out and "boom" in out
    assert "1 file failed to load" in out


def test_missing_path_is_a_usage_error(tmp_path):
    with pytest.raises(SystemExit) as err:
        run("check", str(tmp_path / "nope.py"))
    assert err.value.code == 2


def test_acknowledgements_in_the_file_are_honoured(tmp_path):
    (tmp_path / "backfill_dag.py").write_text(
        dedent(
            """
            # dagwick: ack catchup -- backfills daily files after outages
            from datetime import datetime

            from airflow.providers.standard.operators.empty import EmptyOperator
            from airflow.sdk import DAG

            with DAG(
                "backfill_dag", schedule="@daily", catchup=True, start_date=datetime(2026, 1, 1)
            ):
                EmptyOperator(task_id="load")
            """
        )
    )
    code, out = run("check", str(tmp_path), "--json")
    (report,) = json.loads(out)["dags"]
    assert checks(report)["catchup"]["status"] == "ack"


def test_dag_code_output_does_not_corrupt_json(tmp_path, capsys):
    (tmp_path / "noisy_dag.py").write_text(
        dedent(
            """
            from airflow.providers.standard.operators.empty import EmptyOperator
            from airflow.sdk import DAG

            print("hello from the DAG file")
            with DAG("noisy_dag", schedule=None):
                EmptyOperator(task_id="t")
            """
        )
    )
    code, out = run("check", str(tmp_path), "--json")
    assert json.loads(out)["dags"][0]["dag_id"] == "noisy_dag"
    assert "hello from the DAG file" in capsys.readouterr().err


def test_version_flag(capsys):
    from dagwick import __version__

    with pytest.raises(SystemExit):
        main(["--version"])
    assert capsys.readouterr().out.strip() == f"dagwick {__version__}"


def test_check_command_uses_the_dagwick_settings(monkeypatch):
    path = str(DAGS / "demo_shining_pipeline.py")
    monkeypatch.delenv("AIRFLOW__DAGWICK__GRADES", raising=False)
    monkeypatch.setenv("AIRFLOW__DAGWICK__DISABLED_CHECKS", "tags")
    monkeypatch.setenv("AIRFLOW__DAGWICK__WEIGHTS", "retries:40")
    code, out = run("check", path, "--json")
    (report,) = json.loads(out)["dags"]
    assert "tags" not in checks(report)
    assert checks(report)["retries"]["weight"] == 40

    monkeypatch.setenv("AIRFLOW__DAGWICK__GRADES", "A:100.1")  # invalid: defaults apply
    code, _ = run("check", path, "--min-grade", "A")
    assert code == OK


def test_dispute_hint_goes_to_stderr_only_when_a_check_is_flagged():
    out, err = io.StringIO(), io.StringIO()
    main(["check", str(DAGS)], out=out, err=err)
    assert "issues/new?template=dispute.yml" in err.getvalue()
    assert "dispute" not in out.getvalue()

    out, err = io.StringIO(), io.StringIO()
    main(["check", str(DAGS / "demo_shining_pipeline.py")], out=out, err=err)
    assert err.getvalue() == ""


def test_dispute_hint_stays_out_of_json_output():
    out, err = io.StringIO(), io.StringIO()
    main(["check", str(DAGS), "--json"], out=out, err=err)
    json.loads(out.getvalue())
    assert err.getvalue() == ""


def test_check_packs_do_not_trigger_the_dispute_hint():
    from dagwick.cli import flagged

    pack = {"checks": [{"status": "fail", "pack": "acme-checks"}]}
    builtin = {"checks": [{"status": "warn", "pack": "dagwick"}]}
    assert not flagged([pack])
    assert flagged([pack, builtin])

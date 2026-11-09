from __future__ import annotations

from textwrap import dedent

import pytest
from conftest import DAGS

from dagwick import Context
from dagwick.checks._source import airflow_redirects, parse, variable_get_lines
from dagwick.checks.performance import duration
from dagwick.core import score_dag


def check(dag, check_id, **context):
    report = score_dag(dag, Context(**context))
    return next(c for c in report["checks"] if c["id"] == check_id)


def lines(source):
    return variable_get_lines(parse(dedent(source)))


def test_variable_get_at_module_level_is_found():
    assert lines(
        """
        from airflow.sdk import Variable
        bucket = Variable.get("bucket")
        """
    ) == [3]


def test_variable_get_in_default_args_and_task_arguments_is_found():
    assert lines(
        """
        from airflow.sdk import DAG, Variable
        default_args = {"owner": Variable.get("owner")}
        with DAG("d") as dag:
            BashOperator(task_id="t", bash_command=Variable.get("cmd"))
        """
    ) == [3, 5]


def test_decorator_and_default_arguments_run_at_parse_time():
    assert lines(
        """
        from airflow.sdk import Variable, task
        @task(pool=Variable.get("pool"))
        def load(path=Variable.get("path")):
            return Variable.get("inside")
        """
    ) == [3, 4]


def test_variable_get_inside_functions_lambdas_and_methods_is_ignored():
    assert (
        lines(
            """
        from airflow.sdk import Variable
        def load():
            return Variable.get("a")
        async def aload():
            return Variable.get("b")
        cb = lambda: Variable.get("c")
        class Loader:
            def run(self):
                return Variable.get("d")
        """
        )
        == []
    )


def test_aliases_and_attribute_access_are_found():
    assert lines(
        """
        from airflow.sdk import Variable as V
        from airflow import models
        a = V.get("a")
        b = models.Variable.get("b")
        c = config.get("c")
        """
    ) == [4, 5]


def test_class_bodies_run_at_parse_time():
    assert lines(
        """
        from airflow.sdk import Variable
        class Settings:
            bucket = Variable.get("bucket")
        """
    ) == [4]


def test_parse_time_variables_fails_and_names_the_lines(shining):
    source = 'from airflow.sdk import Variable\nX = Variable.get("x")\nY = Variable.get("y")\n'
    result = check(shining, "parse_time_variables", source=source)
    assert result["status"] == "fail"
    assert result["items"] == ["line 2", "line 3"]
    assert "2 Variable.get calls" in result["message"]
    assert "var.value" in result["example"]


def test_parse_time_variables_passes_on_clean_source(shining):
    source = (DAGS / "demo_shining_pipeline.py").read_text()
    assert check(shining, "parse_time_variables", source=source)["status"] == "pass"


@pytest.mark.parametrize("source", [None, "", "def broken(:\n"])
def test_source_checks_skip_without_usable_source(shining, source):
    for check_id in ("parse_time_variables", "current_imports"):
        result = check(shining, check_id, source=source)
        assert result["status"] == "skip", check_id
        assert result["points"] == 0


def test_deprecated_import_paths_come_from_airflow_itself():
    redirects = airflow_redirects("airflow.operators.bash")
    assert redirects["BashOperator"].startswith("airflow.providers.standard.")


@pytest.mark.parametrize(
    "module",
    ["airflow.sdk", "airflow.providers.standard.operators.bash", "pandas", "airflow.not_a_module"],
)
def test_current_and_unknown_modules_have_no_redirects(module):
    assert airflow_redirects(module) == {}


def test_current_imports_warns_with_the_new_location(shining):
    source = dedent(
        """
        from airflow.operators.bash import BashOperator
        from airflow.providers.standard.operators.empty import EmptyOperator
        from airflow.sdk import DAG
        from .helpers import thing
        """
    )
    result = check(shining, "current_imports", source=source)
    assert result["status"] == "warn"
    (item,) = result["items"]
    assert item.startswith("line 2: airflow.operators.bash.BashOperator → ")
    assert "airflow.providers.standard.operators.bash.BashOperator" in item


def test_current_imports_passes_on_the_demo_dags(shining):
    source = (DAGS / "demo_shining_pipeline.py").read_text()
    assert check(shining, "current_imports", source=source)["status"] == "pass"


@pytest.mark.parametrize(
    ("seconds", "status"),
    [(None, "skip"), (0.4, "pass"), (4.9, "pass"), (5.0, "warn"), (19.9, "warn"), (20.0, "fail")],
)
def test_parse_time_bands(shining, seconds, status):
    result = check(shining, "parse_time", parse_seconds=seconds)
    assert result["status"] == status
    if seconds is not None:
        assert duration(seconds) in result["message"]


def test_new_checks_skip_without_context_so_scores_do_not_drop(shining):
    report = score_dag(shining)
    statuses = {c["id"]: c["status"] for c in report["checks"]}
    for check_id in ("parse_time", "parse_time_variables", "current_imports"):
        assert statuses[check_id] == "skip"
    assert report["score"] == 100.0


@pytest.mark.parametrize(("seconds", "text"), [(0.048, "0.05 s"), (0.4, "0.40 s"), (6.25, "6.2 s")])
def test_parse_durations_read_naturally(seconds, text):
    assert duration(seconds) == text

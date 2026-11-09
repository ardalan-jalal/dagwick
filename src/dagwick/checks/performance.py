from __future__ import annotations

from typing import Any

from dagwick.checks._source import parse, variable_get_lines
from dagwick.core import Category, Context, Finding, Status, check

PARSE_WARN_SECONDS = 5.0
PARSE_FAIL_SECONDS = 20.0


def duration(seconds: float) -> str:
    return f"{seconds:.2f} s" if seconds < 1 else f"{seconds:.1f} s"


def parse_status(seconds: float | None) -> Status:
    if seconds is None:
        return Status.SKIP
    if seconds >= PARSE_FAIL_SECONDS:
        return Status.FAIL
    if seconds >= PARSE_WARN_SECONDS:
        return Status.WARN
    return Status.PASS


@check(
    id="parse_time",
    title="Fast to parse",
    category=Category.PERFORMANCE,
    weight=5,
    example=(
        "rows = requests.get(URL).json()  # runs on every parse\n\n"
        "@task\n"
        "def load():\n"
        "    rows = requests.get(URL).json()  # runs only when the task runs"
    ),
    fix=(
        "Move slow top-level work (API calls, database queries, heavy imports) into tasks. "
        "The DAG processor re-parses the file every few minutes, and a file slower than "
        "dagbag_import_timeout (30 s by default) fails to load."
    ),
)
def parse_time(dag: Any, context: Context) -> Finding:
    status = parse_status(context.parse_seconds)
    if status is Status.SKIP:
        return Finding(Status.SKIP, "The file's parse time is not known yet.")
    took = duration(context.parse_seconds)
    if status is Status.PASS:
        return Finding(Status.PASS, f"The file parses in {took}.")
    if status is Status.WARN:
        return Finding(Status.WARN, f"The file takes {took} to parse, on every parse loop.")
    return Finding(Status.FAIL, f"The file takes {took} to parse; near the import timeout.")


@check(
    id="parse_time_variables",
    title="No Variable.get at parse time",
    category=Category.PERFORMANCE,
    weight=5,
    example='BashOperator(task_id="load", bash_command="load.sh {{ var.value.bucket }}")',
    fix=(
        "Read Variables inside a task, or through a template such as "
        "{{ var.value.name }}, so they are read when the task runs, not on every parse."
    ),
)
def parse_time_variables(dag: Any, context: Context) -> Finding:
    tree = parse(context.source) if context.source else None
    if tree is None:
        return Finding(Status.SKIP, "The DAG's source code is not available.")
    lines = variable_get_lines(tree)
    if not lines:
        return Finding(Status.PASS, "No Variable.get runs when the file is parsed.")
    noun = "call runs" if len(lines) == 1 else "calls run"
    return Finding(
        Status.FAIL,
        f"{len(lines)} Variable.get {noun} on every parse, each one a metadata or secrets lookup.",
        tuple(f"line {n}" for n in lines),
    )

from __future__ import annotations

import argparse
import contextlib
import json
import os
import sys
from collections import Counter
from collections.abc import Sequence
from pathlib import Path
from typing import Any, TextIO

from dagwick import __version__
from dagwick.core import Context, score_dag

GRADES = ("A", "B", "C", "D", "F")
ICON = {"fail": "x", "warn": "!"}

OK, BELOW_GRADE, LOAD_ERROR = 0, 1, 2

DISPUTE_URL = "https://github.com/dagwick/dagwick/issues/new?template=dispute.yml"
DISPUTE_HINT = f"Disagree with a check or hit a false positive? Tell us: {DISPUTE_URL}"


def _dagbag(path: Path) -> Any:
    try:
        from airflow.dag_processing.dagbag import DagBag
    except ImportError:
        from airflow.models.dagbag import DagBag
    try:
        return DagBag(dag_folder=str(path), include_examples=False)
    except TypeError:
        return DagBag(dag_folder=str(path))


def _serialization() -> Any:
    try:
        from airflow.serialization.serialized_objects import DagSerialization
    except ImportError:
        from airflow.serialization.serialized_objects import SerializedDAG as DagSerialization
    return DagSerialization


def _stat_path(root: Path, stat_file: str) -> str:
    if root.is_file():
        return str(root.resolve())
    file = Path(stat_file)
    return str((file if file.is_absolute() else root / file).resolve())


def load(paths: Sequence[Path]) -> tuple[list[tuple[Any, dict[str, Any]]], dict[str, str]]:
    from dagwick.checks._sensors import sensor_task_ids

    serialization = _serialization()
    found: list[tuple[Any, str, float | None]] = []
    errors: dict[str, str] = {}
    for path in paths:
        bag = _dagbag(path)
        errors.update(bag.import_errors)
        seconds = {
            _stat_path(path, stat.file): stat.duration.total_seconds() for stat in bag.dagbag_stats
        }
        for dag in bag.dags.values():
            fileloc = str(dag.fileloc)
            found.append((dag, fileloc, seconds.get(str(Path(fileloc).resolve()))))
    per_file = Counter(fileloc for _, fileloc, _ in found)
    sources: dict[str, str | None] = {}
    scored = []
    for dag, fileloc, parse in found:
        if fileloc not in sources:
            try:
                sources[fileloc] = Path(fileloc).read_text(encoding="utf-8")
            except OSError:
                sources[fileloc] = None
        data = serialization.to_dict(dag)
        context = Context(
            dags_in_file=per_file[fileloc],
            source=sources[fileloc],
            parse_seconds=parse,
            sensor_tasks=sensor_task_ids(data),
        )
        report = score_dag(serialization.from_dict(data), context)
        scored.append((dag, {**report, "file": fileloc}))
    return scored, errors


def below(grade: str, minimum: str | None) -> bool:
    return minimum is not None and GRADES.index(grade) > GRADES.index(minimum)


def render(
    reports: list[dict[str, Any]], errors: dict[str, str], minimum: str | None, out: TextIO
) -> None:
    for file, error in sorted(errors.items()):
        last = error.strip().splitlines()[-1] if error.strip() else "import error"
        print(f"ERROR  {file}\n       {last}", file=out)
    for r in sorted(reports, key=lambda r: (r["score"], r["dag_id"])):
        flag = "  <- below " + minimum if below(r["grade"], minimum) else ""
        print(f"{r['grade']}  {r['score']:5.1f}  {r['dag_id']}  ({r['file']}){flag}", file=out)
        for c in r["checks"]:
            if c["status"] in ICON:
                print(f"       {ICON[c['status']]} {c['title']}: {c['fix']}", file=out)
                for item in c["items"][:5]:
                    print(f"           {item}", file=out)
    failing = sum(below(r["grade"], minimum) for r in reports)
    summary = f"{len(reports)} DAG{'s' if len(reports) != 1 else ''} checked"
    if minimum:
        summary += f", {failing} below grade {minimum}"
    if errors:
        summary += f", {len(errors)} file{'s' if len(errors) != 1 else ''} failed to load"
    print(summary, file=out)


def flagged(reports: list[dict[str, Any]]) -> bool:
    """Whether any built-in check failed or warned, so a dispute could make sense."""
    return any(
        c["status"] in ICON and c.get("pack", "dagwick") == "dagwick"
        for r in reports
        for c in r["checks"]
    )


def main(
    argv: Sequence[str] | None = None, out: TextIO = sys.stdout, err: TextIO = sys.stderr
) -> int:
    parser = argparse.ArgumentParser(prog="dagwick", description="Grade Airflow DAGs.")
    parser.add_argument("--version", action="version", version=f"dagwick {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)
    check = sub.add_parser(
        "check",
        help="score the DAGs in files or folders",
        description=(
            "Score the DAGs in the given files or folders with the same checks as the "
            "Airflow UI. The DAG files are imported, so their top-level code runs."
        ),
    )
    check.add_argument("paths", nargs="+", type=Path, help="DAG files or folders")
    check.add_argument(
        "--min-grade",
        choices=GRADES,
        type=str.upper,
        help="exit with status 1 if any DAG scores below this grade",
    )
    check.add_argument("--json", action="store_true", help="print the reports as JSON")
    args = parser.parse_args(argv)

    missing = [str(p) for p in args.paths if not p.exists()]
    if missing:
        parser.error(f"no such file or folder: {', '.join(missing)}")

    os.environ.setdefault("AIRFLOW__CORE__LOAD_EXAMPLES", "False")
    with contextlib.redirect_stdout(sys.stderr):
        scored, errors = load(args.paths)
    reports = [report for _, report in scored]
    if args.json:
        json.dump({"dags": reports, "import_errors": errors}, out, indent=2, default=str)
        out.write("\n")
    else:
        render(reports, errors, args.min_grade, out)
        if flagged(reports):
            print(DISPUTE_HINT, file=err)
    if errors:
        return LOAD_ERROR
    if any(below(r["grade"], args.min_grade) for r in reports):
        return BELOW_GRADE
    return OK


if __name__ == "__main__":
    sys.exit(main())

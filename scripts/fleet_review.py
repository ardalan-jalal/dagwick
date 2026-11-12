"""Tools for validating Dagwick on a real Airflow deployment (issue #33).

    # Time the fleet page's API and save its JSON:
    AIRFLOW_TOKEN=... python scripts/fleet_review.py time https://airflow.example.com \
        --runs 3 --save fleet.json

    # Turn that JSON into a review sheet for DAG owners (one row per finding):
    python scripts/fleet_review.py sheet fleet.json --owner data-team > review.csv

Standard library only. The token is read from the AIRFLOW_TOKEN environment
variable (an Airflow API token from POST /auth/token); it is never printed or saved.
Keep fleet.json and review.csv out of the repository: they hold real DAG names.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from collections.abc import Callable, Iterable
from typing import Any, TextIO

FLEET_PATH = "/dagwick/api/fleet"
SHEET_COLUMNS = (
    "dag_id",
    "owners",
    "score",
    "grade",
    "check_id",
    "check_title",
    "status",
    "points_lost",
    "verdict",
    "notes",
)
VERDICTS = "useful | false alarm | noise"

Fetch = Callable[[str, dict[str, str]], bytes]


def _is_local(url: str) -> bool:
    host = urllib.parse.urlsplit(url).hostname or ""
    return host in ("localhost", "127.0.0.1", "::1")


def _fetch(url: str, headers: dict[str, str]) -> bytes:
    if not url.startswith(("https://", "http://")):
        raise ValueError("the Airflow URL must start with https:// or http://")
    headers = dict(headers)
    token = headers.pop("Authorization", None)
    if token and url.startswith("http://") and not _is_local(url):
        raise ValueError("refusing to send the token over plain http://; use https://")
    request = urllib.request.Request(url, headers=headers)
    if token:
        # Not resent if the server redirects, possibly to another host.
        request.add_unredirected_header("Authorization", token)
    with urllib.request.urlopen(request, timeout=300) as response:  # noqa: S310 (scheme checked)
        return response.read()


def time_fleet(
    base_url: str,
    token: str | None = None,
    runs: int = 3,
    fetch: Fetch = _fetch,
    clock: Callable[[], float] = time.perf_counter,
) -> tuple[list[float], dict[str, Any]]:
    """Request the fleet API `runs` times; return each duration and the last body.

    The first run is the cold one (Dagwick's score cache is empty after a restart);
    later runs show the cached speed.
    """
    url = base_url.rstrip("/") + FLEET_PATH
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    durations: list[float] = []
    body: dict[str, Any] = {}
    for _ in range(max(1, runs)):
        start = clock()
        raw = fetch(url, headers)
        durations.append(clock() - start)
        body = json.loads(raw)
    return durations, body


def timing_summary(durations: list[float], fleet: dict[str, Any]) -> str:
    dags = len(fleet.get("dags", []))
    lines = [f"DAGs on the fleet page: {dags}" + (" (truncated)" if fleet.get("truncated") else "")]
    for i, seconds in enumerate(durations, 1):
        label = "cold" if i == 1 else "warm"
        lines.append(f"run {i} ({label}): {seconds:.2f} s")
    return "\n".join(lines)


def sheet_rows(fleet: dict[str, Any], owner: str | None = None) -> Iterable[list[Any]]:
    """One row per failing or warning check, for DAG owners to give a verdict on."""
    for dag in fleet.get("dags", []):
        owners = dag.get("owners", "")
        if owner and owner.lower() not in [o.strip().lower() for o in owners.split(",")]:
            continue
        for issue in dag.get("issues", []):
            yield [
                dag["dag_id"],
                owners,
                dag.get("score"),
                dag.get("grade"),
                issue["id"],
                issue["title"],
                issue["status"],
                issue.get("gain"),
                "",
                "",
            ]


def _cell(value: Any) -> Any:
    # A spreadsheet would run text starting with these as a formula.
    if isinstance(value, str) and value[:1] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + value
    return value


def write_sheet(fleet: dict[str, Any], out: TextIO, owner: str | None = None) -> int:
    writer = csv.writer(out)
    writer.writerow(SHEET_COLUMNS)
    count = 0
    for row in sheet_rows(fleet, owner):
        writer.writerow([_cell(v) for v in row])
        count += 1
    return count


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="command", required=True)

    t = sub.add_parser("time", help="time the fleet API and optionally save its JSON")
    t.add_argument("url", help="Airflow base URL, for example https://airflow.example.com")
    t.add_argument("--runs", type=int, default=3, help="number of requests (default 3)")
    t.add_argument("--save", metavar="FILE", help="write the fleet JSON to FILE")

    s = sub.add_parser("sheet", help="write a review sheet (CSV) from saved fleet JSON")
    s.add_argument("fleet_json", help="file written by `time --save`")
    s.add_argument("--owner", help="only DAGs with this owner")

    args = parser.parse_args(argv)
    if args.command == "time":
        durations, fleet = time_fleet(args.url, os.environ.get("AIRFLOW_TOKEN"), args.runs)
        print(timing_summary(durations, fleet))
        if args.save:
            with open(args.save, "w", encoding="utf-8") as f:
                json.dump(fleet, f, indent=2)
        return 0
    with open(args.fleet_json, encoding="utf-8") as f:
        fleet = json.load(f)
    count = write_sheet(fleet, sys.stdout, args.owner)
    print(f"{count} findings; verdict column: {VERDICTS}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())

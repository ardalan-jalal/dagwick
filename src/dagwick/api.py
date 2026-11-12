"""HTTP API served inside the Airflow api-server under ``/dagwick``."""

from __future__ import annotations

import logging
import threading
import uuid
from datetime import date
from pathlib import Path
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse

from dagwick import __version__, settings, themes
from dagwick.checks._sensors import sensor_task_ids
from dagwick.checks.performance import SLOW_POKE_SECONDS, parse_status
from dagwick.core import Context, registered_checks, score_dag

log = logging.getLogger(__name__)
STATIC_DIR = Path(__file__).parent / "static"
FLEET_LIMIT = 2000


# What each endpoint reads, as Airflow's DAG sub-permissions (DagAccessEntity names).
# Core Airflow asks for the same ones before it shows this data: CODE for DAG source,
# VERSION for DAG versions, RUN and TASK_INSTANCE for runs and their task instances.
NEEDS = {
    "score": ("CODE", "TASK_INSTANCE"),  # checks read the source; sensor checks read TIs
    "history": ("CODE", "VERSION"),  # scores each stored version from its source
    "health": ("RUN", "TASK_INSTANCE"),
    "fleet": ("CODE", "RUN", "TASK_INSTANCE"),  # scores and run health for every DAG
}


def _require_dag_read(*entities: str, dag: bool = True) -> list[Any]:
    """Reuse Airflow's own DAG permission checks (same rules as the REST API).

    ``dag`` asks for read access to the DAG itself; each name in ``entities`` adds the
    DAG sub-permission core Airflow requires for that data (for example "DAG Code" with
    the FAB auth manager). A name this Airflow version doesn't know is skipped.
    """
    from airflow.api_fastapi.auth.managers.models.resource_details import DagAccessEntity
    from airflow.api_fastapi.core_api.security import requires_access_dag

    checks = [requires_access_dag(method="GET")] if dag else []
    for name in entities:
        entity = DagAccessEntity.__members__.get(name)
        if entity is not None:
            checks.append(requires_access_dag(method="GET", access_entity=entity))
    return [Depends(check) for check in checks]


def _require_login() -> Any:
    from airflow.api_fastapi.core_api.security import requires_authenticated

    return Depends(requires_authenticated())


def _user() -> Any:
    """Airflow's own user resolver: Bearer header, OAuth token, or the UI cookie."""
    from airflow.api_fastapi.core_api.security import get_user

    return Depends(get_user)


class _ScoreCache:
    """Scores keyed by (dag_id, dag_hash): a DAG is re-scored only when its code changes."""

    def __init__(self, max_entries: int = 5000) -> None:
        self._data: dict[str, tuple[str, dict[str, Any]]] = {}
        self._lock = threading.Lock()
        self._max = max_entries

    def get(self, dag_id: str, dag_hash: str) -> dict[str, Any] | None:
        with self._lock:
            hit = self._data.get(dag_id)
        return hit[1] if hit and hit[0] == dag_hash else None

    def put(self, dag_id: str, dag_hash: str, report: dict[str, Any]) -> None:
        with self._lock:
            if dag_id not in self._data and len(self._data) >= self._max:
                self._data.pop(next(iter(self._data)))
            self._data[dag_id] = (dag_hash, report)


_cache = _ScoreCache()


def _dags_per_file(filelocs: list[str] | None = None) -> dict[str, int]:
    """How many active DAGs each file defines (one grouped query)."""
    from airflow.models.dag import DagModel
    from airflow.utils.session import create_session
    from sqlalchemy import func, select

    query = select(DagModel.fileloc, func.count()).where(DagModel.is_stale.is_(False))
    if filelocs is not None:
        query = query.where(DagModel.fileloc.in_(filelocs))
    with create_session() as session:
        return dict(session.execute(query.group_by(DagModel.fileloc)).all())


FileFacts = tuple[str | None, float | None]


def _file_facts(dag_ids: list[str]) -> dict[str, FileFacts]:
    from airflow.models.dag import DagModel
    from airflow.models.dagcode import DagCode
    from airflow.utils.session import create_session
    from sqlalchemy import select

    facts: dict[str, FileFacts] = {}
    try:
        with create_session() as session:
            parse_seconds = dict(
                session.execute(
                    select(DagModel.dag_id, DagModel.last_parse_duration).where(
                        DagModel.dag_id.in_(dag_ids)
                    )
                ).all()
            )
            hashes: dict[str, str] = {}
            for dag_id, code_hash in session.execute(
                select(DagCode.dag_id, DagCode.source_code_hash)
                .where(DagCode.dag_id.in_(dag_ids))
                .order_by(DagCode.last_updated)
            ).all():
                hashes[dag_id] = code_hash
    except Exception:
        log.exception("dagwick: could not read source hashes and parse times")
        return {}
    for dag_id in dag_ids:
        facts[dag_id] = (hashes.get(dag_id), parse_seconds.get(dag_id))
    return facts


def _source(dag_id: str) -> str | None:
    from airflow.models.dagcode import DagCode

    try:
        return DagCode.code(dag_id)
    except Exception:
        log.exception("dagwick: could not read the source of DAG %s", dag_id)
        return None


SENSOR_WINDOW_DAYS = 30
SensorRuns = dict[str, tuple[float | None, bool]]


def _sensor_runs(dag_id: str, task_ids: tuple[str, ...]) -> SensorRuns:
    import statistics
    from datetime import datetime, timedelta, timezone

    from airflow.models.taskinstance import TaskInstance
    from airflow.models.taskreschedule import TaskReschedule
    from airflow.utils.session import create_session
    from sqlalchemy import select

    if not task_ids:
        return {}
    since = datetime.now(timezone.utc) - timedelta(days=SENSOR_WINDOW_DAYS)
    durations: dict[str, list[float]] = {}
    try:
        with create_session() as session:
            for task_id, duration in session.execute(
                select(TaskInstance.task_id, TaskInstance.duration).where(
                    TaskInstance.dag_id == dag_id,
                    TaskInstance.task_id.in_(task_ids),
                    TaskInstance.state == "success",
                    TaskInstance.end_date >= since,
                )
            ).all():
                if duration is not None:
                    durations.setdefault(task_id, []).append(float(duration))
            rescheduled = set(
                session.scalars(
                    select(TaskInstance.task_id)
                    .join(TaskReschedule, TaskReschedule.ti_id == TaskInstance.id)
                    .where(TaskInstance.dag_id == dag_id, TaskInstance.task_id.in_(task_ids))
                    .distinct()
                ).all()
            )
    except Exception:
        log.exception("dagwick: could not read sensor history for DAG %s", dag_id)
        return {}
    return {
        t: (statistics.median(durations[t]) if t in durations else None, t in rescheduled)
        for t in task_ids
    }


def _default_deferrable() -> bool:
    from airflow.configuration import conf

    try:
        return conf.getboolean("operators", "default_deferrable", fallback=False)
    except Exception:
        return False


def _sensor_band(runs: SensorRuns) -> str:
    return ",".join(
        f"{t}:{int(r)}{'-' if w is None else int(w >= SLOW_POKE_SECONDS)}"
        for t, (w, r) in sorted(runs.items())
    )


def _score_by_id(
    dag_id: str, dags_in_file: int | None = None, facts: FileFacts | None = None
) -> dict[str, Any] | None:
    from airflow.models.serialized_dag import SerializedDagModel

    sdm = SerializedDagModel.get(dag_id)
    if sdm is None:
        return None
    dag = sdm.dag
    if dags_in_file is None and getattr(dag, "fileloc", None):
        dags_in_file = _dags_per_file([dag.fileloc]).get(dag.fileloc)
    if facts is None:
        facts = _file_facts([dag_id]).get(dag_id, (None, None))
    source_hash, parse_seconds = facts
    parse_band = parse_status(parse_seconds).value
    sensors = sensor_task_ids(getattr(sdm, "data", None))
    sensor_runs = _sensor_runs(dag_id, sensors) if sensors else {}
    default_deferrable = _default_deferrable()
    scoring = settings.scoring()
    key = (
        f"{sdm.dag_hash}:{dags_in_file}:{source_hash}:{parse_band}:"
        f"{_sensor_band(sensor_runs)}:{int(default_deferrable)}:{scoring.key}"
    )
    cached = _cache.get(dag_id, key)
    if cached is not None:
        return cached
    context = Context(
        dags_in_file=dags_in_file,
        source=_source(dag_id) if source_hash else None,
        parse_seconds=parse_seconds,
        sensor_tasks=sensors,
        sensor_runs=sensor_runs,
        default_deferrable=default_deferrable,
    )
    report = score_dag(dag, context, scoring)
    _cache.put(dag_id, key, report)
    return report


def _dag_exists(dag_id: str) -> bool:
    from airflow.models.serialized_dag import SerializedDagModel

    return SerializedDagModel.has_dag(dag_id)


NOT_FOUND = "DAG not found or not parsed yet."


def _server_error(what: str, exc: BaseException) -> HTTPException:
    ref = uuid.uuid4().hex[:12]
    log.error("dagwick: %s (ref %s)", what, ref, exc_info=exc)
    return HTTPException(status_code=500, detail=f"Something went wrong (ref {ref}).")


app = FastAPI(title="Dagwick", version=__version__, docs_url=None, redoc_url=None, openapi_url=None)


# Allowlist of the files the UI loads: URL name -> (fixed path, media type).
# The path is never built from the request, only looked up here.
STATIC_FILES: dict[str, tuple[Path, str]] = {
    "dagwick.js": (STATIC_DIR / "dagwick.js", "application/javascript"),
    "icon.svg": (STATIC_DIR / "icon.svg", "image/svg+xml"),
    "icon-dark.svg": (STATIC_DIR / "icon-dark.svg", "image/svg+xml"),
}


@app.get("/static/{name}", include_in_schema=False)
def static(name: str) -> FileResponse:
    entry = STATIC_FILES.get(name)
    if entry is None:
        raise HTTPException(status_code=404)
    path, media_type = entry
    return FileResponse(path, media_type=media_type, headers={"Cache-Control": "no-cache"})


@app.get("/api/health", dependencies=_require_dag_read(*NEEDS["health"]))
def health(dag_id: str = Query(..., min_length=1, max_length=250)) -> dict[str, Any]:
    from dagwick.health import dag_health

    try:
        found = _dag_exists(dag_id)
        result = dag_health(dag_id) if found else None
    except Exception as exc:
        raise _server_error(f"failed to read run health for DAG {dag_id}", exc) from None
    if result is None:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return result


def _fleet_tags(dag_ids: list[str]) -> dict[str, list[str]]:
    """Every DAG's tags in one query; empty when they cannot be read."""
    from airflow.models.dag import DagTag
    from airflow.utils.session import create_session
    from sqlalchemy import select

    tags: dict[str, list[str]] = {}
    try:
        with create_session() as session:
            for dag_id, name in session.execute(
                select(DagTag.dag_id, DagTag.name).where(DagTag.dag_id.in_(dag_ids))
            ).all():
                tags.setdefault(dag_id, []).append(name)
    except Exception:
        log.exception("dagwick: could not read DAG tags for the fleet")
        return {}
    return tags


def _fleet_health(dag_ids: list[str]) -> dict[str, dict[str, Any]]:
    from dagwick.health import fleet_success

    try:
        return fleet_success(dag_ids)
    except Exception:
        log.exception("dagwick: could not read run health for the fleet")
        return {}


@app.get("/api/history", dependencies=_require_dag_read(*NEEDS["history"]))
def history(dag_id: str = Query(..., min_length=1, max_length=250)) -> dict[str, Any]:
    from dagwick.history import dag_history

    try:
        found = _dag_exists(dag_id)
        result = dag_history(dag_id) if found else None
    except Exception as exc:
        raise _server_error(f"failed to read score history for DAG {dag_id}", exc) from None
    if result is None:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return result


@app.get("/api/score", dependencies=_require_dag_read(*NEEDS["score"]))
def score(dag_id: str = Query(..., min_length=1, max_length=250)) -> dict[str, Any]:
    try:
        report = _score_by_id(dag_id)
    except Exception as exc:
        raise _server_error(f"failed to score DAG {dag_id}", exc) from None
    if report is None:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return report


def fleet_entry(
    dag_id: str,
    is_paused: bool,
    owners: str,
    report: dict[str, Any],
    health: dict[str, Any] | None = None,
    tags: list[str] | None = None,
) -> dict[str, Any]:
    """Compact per-DAG summary for the fleet page; issues sorted worst first."""
    issues = [
        {
            "id": c["id"],
            "title": c["title"],
            "status": c["status"],
            "gain": round(c["weight"] - c["points"], 1),
        }
        for c in report["checks"]
        if c["status"] in ("fail", "warn")
    ]
    issues.sort(key=lambda i: (i["status"] != "fail", -i["gain"]))
    return {
        "dag_id": dag_id,
        "score": report["score"],
        "grade": report["grade"],
        "counts": report["counts"],
        "is_paused": bool(is_paused),
        "owners": owners or "",
        "tags": sorted(tags or []),
        "issues": issues,
        "health": health or {"runs": 0, "success_rate": None},
    }


# Like Airflow's own DAG list: the sub-permissions are checked once for the page, and
# get_authorized_dag_ids below narrows the list to the DAGs this user may read.
@app.get("/api/fleet", dependencies=_require_dag_read(*NEEDS["fleet"], dag=False))
def fleet(user: Annotated[Any, _user()]) -> dict[str, Any]:
    """Scores for every active DAG the current user may read."""
    from airflow.api_fastapi.app import get_auth_manager
    from airflow.models.dag import DagModel
    from airflow.utils.session import create_session
    from sqlalchemy import select

    try:
        allowed = get_auth_manager().get_authorized_dag_ids(user=user, method="GET")
        with create_session() as session:
            rows = session.execute(
                select(DagModel.dag_id, DagModel.is_paused, DagModel.owners, DagModel.fileloc)
                .where(DagModel.is_stale.is_(False), DagModel.dag_id.in_(allowed))
                .order_by(DagModel.dag_id)
                .limit(FLEET_LIMIT)
            ).all()
        per_file = _dags_per_file()
        dag_ids = [row[0] for row in rows]
        facts = _file_facts(dag_ids)
        health = _fleet_health(dag_ids)
        tags = _fleet_tags(dag_ids)
        dags = []
        for dag_id, is_paused, owners, fileloc in rows:
            report = _score_by_id(dag_id, per_file.get(fileloc), facts.get(dag_id, (None, None)))
            if report is not None:
                dags.append(
                    fleet_entry(
                        dag_id, is_paused, owners, report, health.get(dag_id), tags.get(dag_id)
                    )
                )
    except Exception as exc:
        raise _server_error("failed to build fleet view", exc) from None
    return {"dags": dags, "truncated": len(rows) >= FLEET_LIMIT}


@app.get("/api/config", dependencies=[_require_login()])
def config() -> dict[str, Any]:
    """Non-secret UI settings."""
    return {
        "seasonal_moods": settings.seasonal_moods(),
        "grades": dict(settings.scoring().grades),
    }


@app.get("/api/themes", dependencies=[_require_login()])
def list_themes() -> list[dict[str, Any]]:
    """Seasonal themes, their dates, and which are in season today (server date)."""
    today = date.today()
    return [t.info(today) for t in themes.THEMES]


@app.get("/api/themes/{theme_id}/css", dependencies=[_require_login()])
def theme_stylesheets(theme_id: str) -> dict[str, str]:
    """A theme as stylesheets, so the Themes page can apply or remove it without a reload."""
    if theme_id not in themes.BY_ID:
        raise HTTPException(status_code=404, detail="Unknown theme")
    return themes.theme_sheets(theme_id)


@app.get("/api/checks", dependencies=[_require_login()])
def checks() -> list[dict[str, Any]]:
    scoring = settings.scoring()
    return [
        {
            "id": c.id,
            "title": c.title,
            "category": c.category.value,
            "weight": scoring.weights.get(c.id, c.weight),
            "default_weight": c.weight,
            "enabled": c.id not in scoring.disabled,
            "fix": c.fix,
            "acknowledgeable": c.acknowledgeable,
            "ack_hint": c.ack_hint,
            "pack": c.pack,
        }
        for c in registered_checks()
    ]


@app.exception_handler(Exception)
async def _unhandled(_request: Any, exc: Exception) -> JSONResponse:
    ref = uuid.uuid4().hex[:12]
    log.error("dagwick: unhandled error (ref %s)", ref, exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": f"Internal error (ref {ref})."})

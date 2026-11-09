"""HTTP API served inside the Airflow api-server under ``/dagwick``."""

from __future__ import annotations

import logging
import threading
import uuid
from pathlib import Path
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse

from dagwick import __version__
from dagwick.checks.performance import parse_status
from dagwick.core import Context, registered_checks, score_dag

log = logging.getLogger(__name__)
STATIC_DIR = Path(__file__).parent / "static"
FLEET_LIMIT = 2000


def _require_dag_read() -> Any:
    """Reuse Airflow's own DAG permission check (same rules as the REST API)."""
    from airflow.api_fastapi.core_api.security import requires_access_dag

    return Depends(requires_access_dag(method="GET"))


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
    key = f"{sdm.dag_hash}:{dags_in_file}:{source_hash}:{parse_band}"
    cached = _cache.get(dag_id, key)
    if cached is not None:
        return cached
    context = Context(
        dags_in_file=dags_in_file,
        source=_source(dag_id) if source_hash else None,
        parse_seconds=parse_seconds,
    )
    report = score_dag(dag, context)
    _cache.put(dag_id, key, report)
    return report


def _server_error(what: str, exc: BaseException) -> HTTPException:
    ref = uuid.uuid4().hex[:12]
    log.error("dagwick: %s (ref %s)", what, ref, exc_info=exc)
    return HTTPException(status_code=500, detail=f"Something went wrong (ref {ref}).")


app = FastAPI(title="Dagwick", version=__version__, docs_url=None, redoc_url=None, openapi_url=None)


STATIC_FILES = {"dagwick.js": "application/javascript", "icon.svg": "image/svg+xml"}


@app.get("/static/{name}", include_in_schema=False)
def static(name: str) -> FileResponse:
    media_type = STATIC_FILES.get(name)  # allowlist: never build paths from user input
    if media_type is None:
        raise HTTPException(status_code=404)
    return FileResponse(
        STATIC_DIR / name, media_type=media_type, headers={"Cache-Control": "no-cache"}
    )


@app.get("/api/score", dependencies=[_require_dag_read()])
def score(dag_id: str = Query(..., min_length=1, max_length=250)) -> dict[str, Any]:
    try:
        report = _score_by_id(dag_id)
    except Exception as exc:
        raise _server_error(f"failed to score DAG {dag_id}", exc) from None
    if report is None:
        raise HTTPException(status_code=404, detail="DAG not found or not parsed yet.")
    return report


def fleet_entry(
    dag_id: str, is_paused: bool, owners: str, report: dict[str, Any]
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
        "issues": issues,
    }


@app.get("/api/fleet")
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
        facts = _file_facts([row[0] for row in rows])
        dags = []
        for dag_id, is_paused, owners, fileloc in rows:
            report = _score_by_id(dag_id, per_file.get(fileloc), facts.get(dag_id, (None, None)))
            if report is not None:
                dags.append(fleet_entry(dag_id, is_paused, owners, report))
    except Exception as exc:
        raise _server_error("failed to build fleet view", exc) from None
    return {"dags": dags, "truncated": len(rows) >= FLEET_LIMIT}


@app.get("/api/config", dependencies=[_require_login()])
def config() -> dict[str, Any]:
    """Non-secret UI settings."""
    from dagwick.settings import seasonal_moods

    return {"seasonal_moods": seasonal_moods()}


@app.get("/api/checks", dependencies=[_require_login()])
def checks() -> list[dict[str, Any]]:
    return [
        {
            "id": c.id,
            "title": c.title,
            "category": c.category.value,
            "weight": c.weight,
            "fix": c.fix,
        }
        for c in registered_checks()
    ]


@app.exception_handler(Exception)
async def _unhandled(_request: Any, exc: Exception) -> JSONResponse:
    ref = uuid.uuid4().hex[:12]
    log.error("dagwick: unhandled error (ref %s)", ref, exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": f"Internal error (ref {ref})."})

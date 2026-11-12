"""Check registry and scoring engine.

A *check* is a function that receives a DAG (normally the serialized DAG read
from the metadata database) and returns a :class:`Finding`. Checks are
registered with the :func:`check` decorator, either inside this package or in
any third-party package (a *check pack*) that exposes a ``dagwick.checks`` entry
point.

The check interface that packs can rely on is ``check``, ``Finding``,
``Status``, ``Category`` and ``Context``, all importable from ``dagwick``.
Everything else in this module (``CheckSpec``, ``CheckResult``, the registry,
``score_dag``'s report layout) is internal and may change before 1.0. See
docs/checks.md, "Write a check pack".
"""

from __future__ import annotations

import inspect
import logging
import threading
from collections.abc import Callable, Mapping
from dataclasses import asdict, dataclass, field
from enum import Enum
from importlib.metadata import entry_points
from typing import Any

from dagwick.settings import DEFAULT_GRADES, Scoring

log = logging.getLogger(__name__)

ENTRY_POINT_GROUP = "dagwick.checks"
BUILTIN_PACK = "dagwick"


class Status(str, Enum):  # str mixin: StrEnum needs Python 3.11
    PASS = "pass"
    WARN = "warn"  # half the points: works, but could be better
    FAIL = "fail"
    SKIP = "skip"  # check does not apply to this DAG; excluded from the score
    ACK = "ack"  # broken on purpose, with a reason in the DAG file; excluded from the score


class Category(str, Enum):
    RELIABILITY = "reliability"
    SCHEDULING = "scheduling"
    OBSERVABILITY = "observability"
    OWNERSHIP = "ownership"
    STRUCTURE = "structure"
    PERFORMANCE = "performance"
    SECURITY = "security"


STATUS_CREDIT = {Status.PASS: 1.0, Status.WARN: 0.5, Status.FAIL: 0.0}


@dataclass(frozen=True)
class Finding:
    """What a check function returns.

    ``items`` names what is affected (usually task_ids) so the UI can point at it.
    """

    status: Status
    message: str
    items: tuple[str, ...] = ()


@dataclass(frozen=True)
class Context:
    """Facts about a DAG that are not on the DAG object itself.

    A check receives it if its function takes a second parameter:
    ``def my_check(dag, context): ...``. ``None`` means "unknown".
    """

    dags_in_file: int | None = None
    source: str | None = field(default=None, repr=False)
    parse_seconds: float | None = None
    sensor_tasks: tuple[str, ...] | None = None
    sensor_runs: dict[str, tuple[float | None, bool]] | None = None
    default_deferrable: bool = False


@dataclass(frozen=True)
class CheckSpec:
    id: str
    title: str
    category: Category
    weight: int
    fix: str
    func: Callable[..., Finding] = field(compare=False, repr=False)
    example: str = ""
    wants_context: bool = False
    acknowledgeable: bool = False
    ack_hint: str = ""
    pack: str = BUILTIN_PACK  # the distribution that registered the check


@dataclass(frozen=True)
class CheckResult:
    id: str
    title: str
    category: str
    weight: int
    status: str
    message: str
    fix: str
    points: float
    items: list[str]
    example: str
    ack_reason: str = ""  # why the DAG breaks this check on purpose (status "ack")
    ack_note: str = ""  # why a "# dagwick: ack" comment for this check was ignored
    pack: str = BUILTIN_PACK  # the distribution that registered the check


_REGISTRY: dict[str, CheckSpec] = {}
_plugins_loaded = False
_plugins_lock = threading.RLock()  # one thread imports the packs; the others wait
_loading_pack: str | None = None  # set while an entry point is being imported


def _pack_for(module: str) -> str:
    """The pack a check belongs to: the entry point being loaded, else its module."""
    if _loading_pack:
        return _loading_pack
    top = module.split(".")[0]
    return BUILTIN_PACK if top == "dagwick" else top


def check(
    *,
    id: str,
    title: str,
    category: Category,
    weight: int,
    fix: str,
    example: str = "",
    acknowledgeable: bool = False,
    ack_hint: str = "",
) -> Callable[[Callable[[Any], Finding]], Callable[[Any], Finding]]:
    """Register a DAG check.

    ``fix`` is a short, actionable hint shown when the check does not pass;
    ``example`` is an optional code snippet showing the fix.
    ``acknowledgeable`` lets a DAG mark the check as broken on purpose with a
    ``# dagwick: ack <id> -- <reason>`` comment; only allow it where there is a
    legitimate reason to break the check. ``ack_hint`` says what the reason must
    explain (for example where failures are alerted instead).
    A check function takes the DAG, and optionally a :class:`Context` as a
    second parameter.
    Re-registering the same ``id`` replaces the previous check, which lets a
    deployment override a built-in rule.
    """
    if weight <= 0:
        raise ValueError(f"check {id!r}: weight must be positive")

    def decorator(func: Callable[..., Finding]) -> Callable[..., Finding]:
        wants_context = len(inspect.signature(func).parameters) >= 2
        _REGISTRY[id] = CheckSpec(
            id,
            title,
            category,
            weight,
            fix,
            func,
            example,
            wants_context,
            acknowledgeable or bool(ack_hint),
            ack_hint,
            _pack_for(func.__module__),
        )
        return func

    return decorator


def load_plugin_checks() -> None:
    """Import every module advertised under the ``dagwick.checks`` entry point.

    A pack that fails to import is logged and skipped; the other checks still run.
    """
    global _plugins_loaded, _loading_pack
    if _plugins_loaded:
        return
    # Without the lock, a second request arriving while the packs import would see
    # "loaded", score with only part of the checks, and cache that score.
    with _plugins_lock:
        if _plugins_loaded or _loading_pack is not None:
            return  # loaded meanwhile, or a pack's import called back into us
        try:
            for ep in entry_points(group=ENTRY_POINT_GROUP):
                dist = getattr(ep, "dist", None)
                _loading_pack = getattr(dist, "name", None) or ep.name
                try:
                    ep.load()
                except Exception:
                    log.exception("Failed to load dagwick checks from entry point %s", ep.name)
                finally:
                    _loading_pack = None
        finally:
            _plugins_loaded = True


def registered_checks() -> list[CheckSpec]:
    from dagwick import checks as _builtin  # noqa: F401  (registers built-ins)

    load_plugin_checks()
    return list(_REGISTRY.values())


def grade_for(score: float, grades: tuple[tuple[str, float], ...] = DEFAULT_GRADES) -> str:
    for grade, threshold in grades:
        if score >= threshold:
            return grade
    return "F"


_warned_unknown: set[str] = set()


def _configured_checks(scoring: Scoring) -> list[tuple[CheckSpec, int]]:
    """The checks that count under ``scoring``, each with its effective weight."""
    specs = registered_checks()
    unknown = (set(scoring.disabled) | set(scoring.weights)) - {s.id for s in specs}
    if unknown - _warned_unknown:
        log.warning("dagwick: [dagwick] settings name unknown check ids %s", sorted(unknown))
        _warned_unknown.update(unknown)
    return [
        (spec, scoring.weights.get(spec.id, spec.weight))
        for spec in specs
        if spec.id not in scoring.disabled
    ]


def _run_one(spec: CheckSpec, dag: Any, context: Context) -> Finding:
    try:
        finding = spec.func(dag, context) if spec.wants_context else spec.func(dag)
    except Exception:
        log.exception("dagwick check %s crashed on DAG %s", spec.id, getattr(dag, "dag_id", "?"))
        return Finding(Status.SKIP, "This check could not run on this DAG.")
    if not isinstance(finding, Finding):
        log.error("dagwick check %s returned %r instead of a Finding", spec.id, type(finding))
        return Finding(Status.SKIP, "This check returned an invalid result.")
    return finding


def _acknowledge(
    spec: CheckSpec, status: Status, acks: Mapping[str, str]
) -> tuple[Status, str, str]:
    """Apply a ``# dagwick: ack`` comment: (status, ack_reason, ack_note)."""
    if spec.id not in acks or status not in (Status.FAIL, Status.WARN):
        return status, "", ""
    if not spec.acknowledgeable:
        return (
            status,
            "",
            "This check can't be acknowledged, so the dagwick: ack comment is ignored.",
        )
    reason = acks[spec.id]
    if not reason:
        need = spec.ack_hint or "why this DAG breaks the check on purpose"
        return (
            status,
            "",
            f"The dagwick: ack comment is ignored: add a reason after -- that says {need}.",
        )
    return Status.ACK, reason, ""


def score_dag(
    dag: Any, context: Context | None = None, scoring: Scoring | None = None
) -> dict[str, Any]:
    """Score a DAG. ``scoring`` defaults to the ``[dagwick]`` settings in airflow.cfg."""
    from dagwick.acknowledge import acknowledgements
    from dagwick.settings import scoring as configured_scoring

    scoring = scoring if scoring is not None else configured_scoring()
    context = context or Context()
    acks = acknowledgements(context.source) if context.source else {}
    results: list[CheckResult] = []
    earned = 0.0
    possible = 0
    for spec, weight in _configured_checks(scoring):
        finding = _run_one(spec, dag, context)
        status, ack_reason, ack_note = _acknowledge(spec, finding.status, acks)
        points = 0.0
        needs_work = status in (Status.FAIL, Status.WARN)
        if status not in (Status.SKIP, Status.ACK):
            possible += weight
            points = weight * STATUS_CREDIT[status]
            earned += points
        results.append(
            CheckResult(
                id=spec.id,
                title=spec.title,
                category=spec.category.value,
                weight=weight,
                status=status.value,
                message=finding.message,
                fix=spec.fix if needs_work else "",
                points=points,
                items=list(finding.items) if needs_work else [],
                example=spec.example if needs_work else "",
                ack_reason=ack_reason,
                ack_note=ack_note,
                pack=spec.pack,
            )
        )

    score = round(earned / possible * 100, 1) if possible else 0.0
    counts = {s.value: sum(r.status == s.value for r in results) for s in Status}
    return {
        "dag_id": dag.dag_id,
        "score": score,
        "grade": grade_for(score, scoring.grades),
        "points": round(earned, 1),
        "max_points": possible,
        "counts": counts,
        "checks": [asdict(r) for r in results],
    }

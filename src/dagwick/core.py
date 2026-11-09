"""Check registry and scoring engine.

A *check* is a function that receives a DAG (normally the serialized DAG read
from the metadata database) and returns a :class:`Finding`. Checks are
registered with the :func:`check` decorator, either inside this package or in
any third-party package that exposes a ``dagwick.checks`` entry point.
"""

from __future__ import annotations

import inspect
import logging
from collections.abc import Callable
from dataclasses import asdict, dataclass, field
from enum import Enum
from importlib.metadata import entry_points
from typing import Any

log = logging.getLogger(__name__)

ENTRY_POINT_GROUP = "dagwick.checks"


class Status(str, Enum):  # str mixin: StrEnum needs Python 3.11
    PASS = "pass"
    WARN = "warn"  # half the points: works, but could be better
    FAIL = "fail"
    SKIP = "skip"  # check does not apply to this DAG; excluded from the score


class Category(str, Enum):
    RELIABILITY = "reliability"
    SCHEDULING = "scheduling"
    OBSERVABILITY = "observability"
    OWNERSHIP = "ownership"
    STRUCTURE = "structure"
    PERFORMANCE = "performance"


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


_REGISTRY: dict[str, CheckSpec] = {}
_plugins_loaded = False


def check(
    *, id: str, title: str, category: Category, weight: int, fix: str, example: str = ""
) -> Callable[[Callable[[Any], Finding]], Callable[[Any], Finding]]:
    """Register a DAG check.

    ``fix`` is a short, actionable hint shown when the check does not pass;
    ``example`` is an optional code snippet showing the fix.
    A check function takes the DAG, and optionally a :class:`Context` as a
    second parameter.
    Re-registering the same ``id`` replaces the previous check, which lets a
    deployment override a built-in rule.
    """
    if weight <= 0:
        raise ValueError(f"check {id!r}: weight must be positive")

    def decorator(func: Callable[..., Finding]) -> Callable[..., Finding]:
        wants_context = len(inspect.signature(func).parameters) >= 2
        _REGISTRY[id] = CheckSpec(id, title, category, weight, fix, func, example, wants_context)
        return func

    return decorator


def load_plugin_checks() -> None:
    """Import every module advertised under the ``dagwick.checks`` entry point."""
    global _plugins_loaded
    if _plugins_loaded:
        return
    _plugins_loaded = True
    for ep in entry_points(group=ENTRY_POINT_GROUP):
        try:
            ep.load()
        except Exception:
            log.exception("Failed to load dagwick checks from entry point %s", ep.name)


def registered_checks() -> list[CheckSpec]:
    from dagwick import checks as _builtin  # noqa: F401  (registers built-ins)

    load_plugin_checks()
    return list(_REGISTRY.values())


def grade_for(score: float) -> str:
    for threshold, grade in ((90, "A"), (75, "B"), (60, "C"), (40, "D")):
        if score >= threshold:
            return grade
    return "F"


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


def score_dag(dag: Any, context: Context | None = None) -> dict[str, Any]:
    results: list[CheckResult] = []
    earned = 0.0
    possible = 0
    for spec in registered_checks():
        finding = _run_one(spec, dag, context or Context())
        points = 0.0
        needs_work = finding.status in (Status.FAIL, Status.WARN)
        if finding.status != Status.SKIP:
            possible += spec.weight
            points = spec.weight * STATUS_CREDIT[finding.status]
            earned += points
        results.append(
            CheckResult(
                id=spec.id,
                title=spec.title,
                category=spec.category.value,
                weight=spec.weight,
                status=finding.status.value,
                message=finding.message,
                fix=spec.fix if needs_work else "",
                points=points,
                items=list(finding.items) if needs_work else [],
                example=spec.example if needs_work else "",
            )
        )

    score = round(earned / possible * 100, 1) if possible else 0.0
    counts = {s.value: sum(r.status == s.value for r in results) for s in Status}
    return {
        "dag_id": dag.dag_id,
        "score": score,
        "grade": grade_for(score),
        "points": round(earned, 1),
        "max_points": possible,
        "counts": counts,
        "checks": [asdict(r) for r in results],
    }

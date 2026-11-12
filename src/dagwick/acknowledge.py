"""Acknowledgements: a DAG file marks a check it breaks on purpose.

A comment anywhere in the DAG file acknowledges one or more checks, with a reason::

    catchup=True,  # dagwick: ack catchup -- backfills daily files after outages

The comment applies to every DAG defined in that file. The source is read with
:mod:`tokenize`, never executed.
"""

from __future__ import annotations

import functools
import io
import logging
import re
import tokenize
from collections.abc import Mapping
from types import MappingProxyType

_ACK = re.compile(
    r"^#\s*dagwick:\s*ack\s+"
    r"(?P<ids>[A-Za-z0-9_]+(?:\s*,\s*[A-Za-z0-9_]+)*)"
    r"\s*(?:(?:--|—|–)\s*(?P<reason>.*))?$",
    re.IGNORECASE,
)

log = logging.getLogger(__name__)

_NONE: Mapping[str, str] = MappingProxyType({})

# An ack reason is shown to everyone who can see the DAG's grade.
MAX_REASON = 200


def _safe_reason(reason: str) -> str:
    """Hide anything that looks like a credential pasted into the comment, and cap it."""
    from dagwick.checks._secrets import PATTERNS, URI_PASSWORD

    for _kind, pattern in PATTERNS:
        reason = pattern.sub("[hidden]", reason)
    reason = URI_PASSWORD.sub(lambda m: m.group(0)[: m.start(1) - m.start()] + "[hidden]@", reason)
    return reason if len(reason) <= MAX_REASON else reason[: MAX_REASON - 1] + "…"


@functools.lru_cache(maxsize=64)
def acknowledgements(source: str) -> Mapping[str, str]:
    """Map each acknowledged check id to its reason ("" when none was given)."""
    reasons: dict[str, list[str]] = {}
    try:
        for tok in tokenize.generate_tokens(io.StringIO(source).readline):
            if tok.type != tokenize.COMMENT:
                continue
            match = _ACK.match(tok.string.strip())
            if not match:
                continue
            reason = _safe_reason((match["reason"] or "").strip())
            for check_id in match["ids"].split(","):
                seen = reasons.setdefault(check_id.strip().lower(), [])
                if reason and reason not in seen:
                    seen.append(reason)
    except (tokenize.TokenError, SyntaxError):
        return _NONE
    except Exception:  # noqa: BLE001
        # tokenize itself can fail on odd text, for example a bare "\r" before a
        # non-ASCII character on Python 3.12 (UnicodeDecodeError, SystemError).
        # A comment must never stop a DAG from being scored.
        log.debug("dagwick: could not read ack comments", exc_info=True)
        return _NONE
    return MappingProxyType({k: "; ".join(v) for k, v in reasons.items()})

"""Seasonal themes for the whole Airflow UI, switched on by date from inside Dagwick.

Airflow's UI reads its theme from ``GET /ui/config``. During a theme's dates, a small
middleware adds the theme's CSS to that reply (merged into any theme the admin already
has), so it shows on every Airflow page and stops by itself afterwards. Nothing is set in
Airflow's configuration and nothing is written anywhere.

Each viewer chooses for themselves on Dagwick's Themes page. The choice lives in cookies
in their browser (Dagwick never writes to Airflow's database):

- ``dagwick_themes_off``: comma-separated theme ids this viewer removed while in season;
  ``*`` in the list turns off "show themes on their dates" altogether.
- ``dagwick_theme``: one theme id this viewer applied; it shows whatever the date.
"""

from __future__ import annotations

import json
import logging
from collections.abc import Callable
from dataclasses import dataclass
from datetime import date
from functools import cache
from http.cookies import CookieError, SimpleCookie
from typing import Any

from dagwick import halloween, snow

log = logging.getLogger(__name__)

OFF_COOKIE = "dagwick_themes_off"
ALL = "*"  # in OFF_COOKIE: no theme appears by date
APPLIED_COOKIE = "dagwick_theme"


MONTHS = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")


def _no_css() -> dict[str, Any]:
    return {}


@dataclass(frozen=True, kw_only=True)
class Theme:
    """A seasonal theme. It runs either on the same dates every year (``start``/``end``)
    or, for festivals on a lunar or other calendar, in the listed ``windows``."""

    id: str  # also the id of Dagwick's matching banner (seasonal mood)
    name: str
    description: str
    start: tuple[int, int] | None = None  # (month, day), inclusive
    end: tuple[int, int] | None = None  # (month, day), inclusive; may wrap into next year
    windows: tuple[tuple[date, date], ...] = ()  # exact (first, last) days, inclusive
    calendar: str = "Islamic calendar"  # the calendar the windows follow, for when()
    css: Callable[[], dict[str, Any]] = _no_css  # decorations; none means banner only

    @property
    def ready(self) -> bool:
        """Its decorations for Airflow are made; otherwise it is "coming soon"."""
        return self.css is not _no_css

    def active_on(self, day: date) -> bool:
        if self.windows:
            return any(first <= day <= last for first, last in self.windows)
        assert self.start and self.end
        v = day.month * 100 + day.day
        a = self.start[0] * 100 + self.start[1]
        b = self.end[0] * 100 + self.end[1]
        return a <= v <= b if a <= b else v >= a or v <= b

    def next_window(self, today: date) -> tuple[date, date] | None:
        """The window running today, or the next one."""
        return next(((a, b) for a, b in sorted(self.windows) if b >= today), None)

    def when(self, today: date) -> str:
        """The dates in words: "18 Dec – 2 Jan · every year", or the next Islamic window."""

        def day(m: int, d: int) -> str:
            return f"{d} {MONTHS[m - 1]}"

        if self.windows:
            window = self.next_window(today)
            if window is None:
                return f"{self.calendar}: no dates listed yet"
            a, b = window
            span = (
                day(a.month, a.day) if a == b else f"{day(a.month, a.day)} – {day(b.month, b.day)}"
            )
            return f"About {span} {b.year} · {self.calendar}, moves each year"
        assert self.start and self.end
        span = (
            day(*self.start) if self.start == self.end else f"{day(*self.start)} – {day(*self.end)}"
        )
        return f"{span} · every year"

    def info(self, today: date) -> dict[str, Any]:
        window = self.next_window(today) if self.windows else None
        start = (window[0].month, window[0].day) if window else self.start
        end = (window[1].month, window[1].day) if window else self.end
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "start": list(start) if start else None,
            "end": list(end) if end else None,
            "when": self.when(today),
            "active": self.active_on(today),
            "decorated": self.ready,
        }


def _d(text: str) -> date:
    return date.fromisoformat(text)


# Islamic-calendar dates (Umm al-Qura), approximate: the exact day can shift by one with
# the moon sighting. Python has no Islamic calendar and Dagwick adds no dependencies, so
# the dates are listed here; extend the table as the years go by.
RAMADAN = tuple(
    (_d(a), _d(b))
    for a, b in (
        ("2026-02-18", "2026-03-19"),
        ("2027-02-08", "2027-03-09"),
        ("2028-01-28", "2028-02-26"),
        ("2029-01-16", "2029-02-13"),
        ("2030-01-06", "2030-02-03"),
        ("2030-12-26", "2031-01-24"),
    )
)
# Eid al-Fitr (1–3 Shawwal) and Eid al-Adha (10–13 Dhu al-Hijjah).
EID = tuple(
    (_d(a), _d(b))
    for a, b in (
        ("2026-03-20", "2026-03-22"),
        ("2026-05-27", "2026-05-30"),
        ("2027-03-10", "2027-03-12"),
        ("2027-05-16", "2027-05-19"),
        ("2028-02-27", "2028-02-29"),
        ("2028-05-05", "2028-05-08"),
        ("2029-02-14", "2029-02-16"),
        ("2029-04-24", "2029-04-27"),
        ("2030-02-04", "2030-02-06"),
        ("2030-04-13", "2030-04-16"),
    )
)


def _around(days: tuple[str, ...], before: int, after: int) -> tuple[tuple[date, date], ...]:
    """Windows from `before` days before to `after` days after each listed day."""
    return tuple(
        (date.fromordinal(_d(d).toordinal() - before), date.fromordinal(_d(d).toordinal() + after))
        for d in days
    )


# Diwali (Lakshmi Puja, the main day) on the Hindu lunisolar calendar, with the two days
# before and after it: the five days of the festival. 2030 and 2031 have fewer sources.
DIWALI = _around(
    ("2026-11-08", "2027-10-29", "2028-10-17", "2029-11-05", "2030-10-26", "2031-11-14"), 2, 2
)
# The Lantern Festival: the 15th day of the first month of the Chinese calendar.
LANTERN_FESTIVAL = _around(
    ("2026-03-03", "2027-02-20", "2028-02-09", "2029-02-27", "2030-02-17", "2031-02-06"), 0, 0
)


def _carsema_sor(year: int) -> date:
    """Çarşema Sor, the Yazidi New Year: the first Wednesday of April on the Julian
    calendar, which is the first Wednesday on or after 14 April (1900–2099)."""
    first = date(year, 4, 14)
    return date.fromordinal(first.toordinal() + (2 - first.weekday()) % 7)


CARSEMA_SOR = tuple((d, d) for d in (_carsema_sor(y) for y in range(2026, 2032)))

# Themes whose decorations for all of Airflow aren't made yet. They are listed as
# "Coming soon" and can't be applied; on their dates Dagwick's banner still dresses up
# (that is the seasonal mood, which doesn't need a theme).
COMING_SOON = (
    "Decorations for all of Airflow are on the way. Until then, Dagwick's banner "
    "dresses up on these dates."
)

# When two themes overlap, the earlier one in this list shows: a short festival wins over
# a longer one (Dagwick's birthday over Diwali, Diwali over Halloween, the Lantern
# Festival over Ramadan).
THEMES: tuple[Theme, ...] = (
    Theme(
        id="christmas",
        name="Christmas snow",
        description="Snowflakes drift over Airflow, some carried sideways by the wind, "
        "with a snow drift along the bottom of the window.",
        start=(12, 18),
        end=(1, 2),
        css=snow.global_css,
    ),
    Theme(
        id="birthday",
        name="Dagwick's birthday",
        description=COMING_SOON,
        start=(11, 8),
        end=(11, 8),
    ),
    Theme(
        id="diwali",
        name="Diwali",
        description=COMING_SOON,
        windows=DIWALI,
        calendar="Hindu calendar",
    ),
    Theme(
        id="halloween",
        name="Halloween",
        description="Bats flit across Airflow, ghosts and embers drift, fog rolls along "
        "the bottom, and spiders dangle from branches on the cards.",
        start=(10, 24),
        end=(11, 1),
        css=halloween.global_css,
    ),
    Theme(id="newroz", name="Newroz", description=COMING_SOON, start=(3, 19), end=(3, 23)),
    Theme(id="eid", name="Eid", description=COMING_SOON, windows=EID),
    Theme(
        id="carsema-sor",
        name="Çarşema Sor",
        description=COMING_SOON,
        windows=CARSEMA_SOR,
        calendar="Yazidi New Year",
    ),
    Theme(
        id="lantern-festival",
        name="Lantern Festival",
        description=COMING_SOON,
        windows=LANTERN_FESTIVAL,
        calendar="Chinese calendar",
    ),
    Theme(id="ramadan", name="Ramadan", description=COMING_SOON, windows=RAMADAN),
    Theme(
        id="language-day",
        name="Kurdish Language Day",
        description=COMING_SOON,
        start=(5, 15),
        end=(5, 15),
    ),
    Theme(id="new-year", name="New Year", description=COMING_SOON, start=(12, 31), end=(1, 2)),
)
BY_ID = {t.id: t for t in THEMES}


@cache
def theme_css(theme_id: str) -> dict[str, Any]:
    """A theme's CSS, built once per process."""
    return BY_ID[theme_id].css()


def _cookies(header: str) -> dict[str, str]:
    jar = SimpleCookie()
    try:
        jar.load(header)
    except CookieError:
        return {}
    return {k: m.value for k, m in jar.items()}


def pick_theme(cookies: dict[str, str], today: date) -> Theme | None:
    """The theme this viewer sees today: the one they applied, else the first in season.
    Themes that are coming soon are never picked.

    Must match pickTheme in ui/src/themes.ts.
    """
    applied = BY_ID.get(cookies.get(APPLIED_COOKIE, "").strip())
    if applied and applied.ready:
        return applied
    off = {part.strip() for part in cookies.get(OFF_COOKIE, "").split(",")}
    if ALL in off:
        return None
    return next((t for t in THEMES if t.ready and t.id not in off and t.active_on(today)), None)


def _decls(style: dict[str, Any], important: bool = False) -> str:
    bang = " !important" if important else ""
    return "".join(
        f"{''.join('-' + c.lower() if c.isupper() else c for c in prop)}:{value}{bang};"
        for prop, value in style.items()
    )


def css_text(rules: dict[str, Any]) -> str:
    """Theme ``globalCss`` as a plain stylesheet, for applying a theme without a reload."""
    out = []
    for selector, body in rules.items():
        if selector.startswith("@media"):
            out.append(f"{selector}{{{css_text(body)}}}")
        elif selector.startswith("@keyframes"):
            steps = "".join(f"{step}{{{_decls(style)}}}" for step, style in body.items())
            out.append(f"{selector}{{{steps}}}")
        else:
            out.append(f"{selector}{{{_decls(body)}}}")
    return "".join(out)


def hide_text(rules: dict[str, Any]) -> str:
    """A stylesheet that hides a theme Airflow already drew, for removing it without a reload."""
    hidden = [s for s in rules if "::" in s and not s.startswith("@")]
    out = [f"{', '.join(hidden)}{{display:none !important;}}"] if hidden else []
    for selector, body in rules.items():
        if not selector.startswith("@") and "::" not in selector and "paddingTop" in body:
            out.append(f"{selector}{{padding-top:0 !important;}}")
    return "".join(out)


def reset_text(rules: dict[str, Any]) -> str:
    """A stylesheet that clears a theme Airflow already drew, so another can be drawn over it.

    Each of the theme's decorations is reset to nothing; the next theme's rules come after
    this in the same stylesheet, so they win.
    """
    pseudo = [s for s in rules if "::" in s and not s.startswith("@")]
    out = [f"{', '.join(pseudo)}{{all:unset;}}"] if pseudo else []
    for selector, body in rules.items():
        if not selector.startswith("@") and "::" not in selector and "paddingTop" in body:
            out.append(f"{selector}{{padding-top:0;}}")
    return "".join(out)


@cache
def theme_sheets(theme_id: str) -> dict[str, str]:
    """A theme as stylesheets, for changing themes without a reload.

    ``css`` draws it; ``hide`` removes it where Airflow drew it at page load; ``reset``
    clears it so that another theme can be drawn in its place.
    """
    rules = theme_css(theme_id)
    return {"css": css_text(rules), "hide": hide_text(rules), "reset": reset_text(rules)}


def apply_theme(config: dict[str, Any], css: dict[str, Any]) -> dict[str, Any]:
    """Merge a theme's CSS into Airflow's UI config, keeping the admin's own theme."""
    theme = dict(config.get("theme") or {})
    theme["globalCss"] = {**(theme.get("globalCss") or {}), **css}
    return {**config, "theme": theme}


def _uncached(send: Callable) -> Callable:
    """Marks the config reply as never to be stored: it depends on the theme cookies.

    Without this a browser (or a proxy) could keep serving the theme from before an
    Apply or Remove, until a hard refresh.
    """

    async def wrapped(message: dict) -> None:
        if message["type"] == "http.response.start":
            kept = [
                (k, v) for k, v in message.get("headers") or [] if k.lower() != b"cache-control"
            ]
            kept += [(b"cache-control", b"no-store"), (b"vary", b"Cookie")]
            message = {**message, "headers": kept}
        await send(message)

    return wrapped


def _is_ui_config(scope: dict) -> bool:
    """Airflow's own ``/ui/config`` route, also when Airflow runs under a base path."""
    path, root = scope.get("path", ""), scope.get("root_path", "")
    if root and path.startswith(root):
        path = path[len(root) :]
    return path == "/ui/config"


class ThemeMiddleware:
    """Adds the viewer's seasonal theme to Airflow's ``GET /ui/config`` reply.

    Every other request passes straight through. Airflow still checks the login for
    /ui/config itself; only a successful, uncompressed JSON reply is changed, and any
    problem leaves the reply exactly as Airflow sent it.
    """

    def __init__(self, app: Any, today: Callable[[], date] = date.today) -> None:
        self.app = app
        self.today = today

    async def __call__(self, scope: dict, receive: Callable, send: Callable) -> None:
        if scope.get("type") != "http" or scope.get("method") != "GET" or not _is_ui_config(scope):
            await self.app(scope, receive, send)
            return
        headers = dict(scope.get("headers") or [])
        theme = pick_theme(_cookies(headers.get(b"cookie", b"").decode("latin-1")), self.today())
        send = _uncached(send)
        if theme is None or not theme_css(theme.id):  # nothing to draw (banner-only theme)
            await self.app(scope, receive, send)
            return

        start: dict[str, Any] = {}
        chunks: list[bytes] = []

        async def capture(message: dict) -> None:
            if message["type"] == "http.response.start":
                start.update(message)
            elif message["type"] == "http.response.body":
                chunks.append(message.get("body", b""))
                if not message.get("more_body"):
                    await finish()
            else:
                await send(message)

        async def finish() -> None:
            body = b"".join(chunks)
            out_headers = list(start.get("headers") or [])
            names = {k.lower(): v for k, v in out_headers}
            if (
                start.get("status") == 200
                and b"content-encoding" not in names
                and names.get(b"content-type", b"").startswith(b"application/json")
            ):
                try:
                    config = json.loads(body)
                    body = json.dumps(apply_theme(config, theme_css(theme.id))).encode()
                    out_headers = [(k, v) for k, v in out_headers if k.lower() != b"content-length"]
                    out_headers.append((b"content-length", str(len(body)).encode()))
                except Exception:  # never break Airflow's UI over a theme
                    log.exception("dagwick: could not add the %s theme", theme.id)
                    body = b"".join(chunks)
                    out_headers = list(start.get("headers") or [])
            await send({**start, "headers": out_headers})
            await send({"type": "http.response.body", "body": body})

        await self.app(scope, receive, capture)

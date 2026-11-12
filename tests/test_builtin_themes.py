from __future__ import annotations

import json
import random
from datetime import date

import pytest
from fastapi import FastAPI
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.testclient import TestClient

from dagwick import snow, themes
from dagwick.api import app as dagwick_app
from dagwick.themes import (
    APPLIED_COOKIE,
    OFF_COOKIE,
    ThemeMiddleware,
    apply_theme,
    pick_theme,
)

CHRISTMAS = themes.BY_ID["christmas"]
IN_SEASON = date(2026, 12, 24)
OUT_OF_SEASON = date(2026, 6, 1)


def test_christmas_runs_over_new_year():
    assert CHRISTMAS.active_on(date(2026, 12, 18))
    assert CHRISTMAS.active_on(date(2027, 1, 2))
    assert not CHRISTMAS.active_on(date(2026, 12, 17))
    assert not CHRISTMAS.active_on(date(2027, 1, 3))


def test_pick_theme_by_date_removed_and_applied():
    assert pick_theme({}, IN_SEASON) is CHRISTMAS
    assert pick_theme({}, OUT_OF_SEASON) is None
    assert pick_theme({OFF_COOKIE: "halloween, christmas"}, IN_SEASON) is None
    assert pick_theme({APPLIED_COOKIE: "christmas"}, OUT_OF_SEASON) is CHRISTMAS
    # An applied theme wins over everything, and an unknown id is ignored.
    assert pick_theme({APPLIED_COOKIE: "christmas", OFF_COOKIE: "*,christmas"}, OUT_OF_SEASON)
    assert pick_theme({APPLIED_COOKIE: "nope"}, OUT_OF_SEASON) is None


def test_turning_off_show_on_dates_stops_every_dated_theme():
    assert pick_theme({OFF_COOKIE: "*"}, IN_SEASON) is None
    assert pick_theme({OFF_COOKIE: "*", APPLIED_COOKIE: "christmas"}, IN_SEASON) is CHRISTMAS


def test_apply_theme_keeps_the_admins_own_theme():
    config = {"x": 1, "theme": {"tokens": {"colors": {}}, "globalCss": {"h1": {"color": "red"}}}}
    out = apply_theme(config, {"body::after": {"content": '""'}})
    assert out["x"] == 1
    assert out["theme"]["tokens"] == {"colors": {}}
    assert set(out["theme"]["globalCss"]) == {"h1", "body::after"}
    assert apply_theme({"theme": None}, {"a": {}})["theme"] == {"globalCss": {"a": {}}}
    assert config["theme"]["globalCss"] == {"h1": {"color": "red"}}  # input not changed


def test_snow_moves_whole_layers_and_stays_still_for_reduced_motion():
    css = snow.global_css()
    hosts = [layer.host for layer in snow.LAYERS]
    for i, host in enumerate(hosts):
        assert css[host]["animation"].startswith(f"dagwickSnow{i} ")
        assert css[host]["willChange"] == "transform"  # moved by the graphics card
        assert css[host]["pointerEvents"] == "none"  # never blocks a click
        assert "translate3d" in json.dumps(css[f"@keyframes dagwickSnow{i}"])
    still = css["@media (prefers-reduced-motion: reduce)"]
    assert all(still[h] == {"animation": "none"} for h in hosts)
    text = json.dumps(css)
    assert "<script" not in text and "animate" not in text.replace("animation", "")
    assert len(text) < 200_000  # sent with every page load, so keep it small


def test_a_layer_repeat_wraps_flakes_around_its_edges():
    layer = snow.Layer("x", 100, 100, 1, "dot", (40, 40), (1, 1), 1, 0)
    for seed in range(20):  # a big flake is always near an edge, so it gets copies
        svg = snow.layer_svg(random.Random(seed), layer, "dark")
        assert svg.count("<use ") >= 4


def test_theme_as_stylesheets():
    sheets = themes.theme_sheets("christmas")
    assert "@keyframes dagwickSnow0{" in sheets["css"]
    assert "will-change:transform;" in sheets["css"]  # camelCase becomes CSS
    assert "@media (prefers-reduced-motion: reduce){" in sheets["css"]
    assert "display:none !important" in sheets["hide"]
    assert "padding-top:0 !important" in sheets["hide"]
    assert "{all:unset;}" in sheets["reset"]


def _airflow(status: int = 200, gzip: bool = False) -> TestClient:
    """A stand-in for Airflow: /ui/config plus another route, behind the middleware."""
    inner = FastAPI()

    @inner.get("/ui/config")
    def config():
        headers = {"content-encoding": "x-compressed"} if gzip else None
        return JSONResponse({"instance_name": "Airflow", "theme": None}, status, headers)

    @inner.get("/ui/other")
    def other():
        return PlainTextResponse("untouched")

    def at(day: date) -> TestClient:
        return TestClient(ThemeMiddleware(inner, today=lambda: day))

    return at  # type: ignore[return-value]


def test_middleware_adds_the_theme_in_season():
    res = _airflow()(IN_SEASON).get("/ui/config")
    body = res.json()
    assert body["instance_name"] == "Airflow"
    assert "body::after" in body["theme"]["globalCss"]
    assert int(res.headers["content-length"]) == len(res.content)


@pytest.mark.parametrize(
    ("day", "cookies", "themed"),
    [
        (OUT_OF_SEASON, {}, False),
        (IN_SEASON, {OFF_COOKIE: "christmas"}, False),
        (OUT_OF_SEASON, {APPLIED_COOKIE: "christmas"}, True),
    ],
)
def test_middleware_follows_the_date_and_the_viewers_choice(day, cookies, themed):
    client = _airflow()(day)
    client.cookies.update(cookies)
    assert (client.get("/ui/config").json()["theme"] is not None) == themed


@pytest.mark.parametrize("day", [IN_SEASON, OUT_OF_SEASON])
def test_config_reply_is_never_cached_because_it_follows_the_cookies(day):
    # Otherwise the browser could keep the old theme after Apply or Remove.
    res = _airflow()(day).get("/ui/config")
    assert res.headers["cache-control"] == "no-store"
    assert "Cookie" in res.headers.get_list("vary")
    assert "cache-control" not in _airflow()(day).get("/ui/other").headers


def test_middleware_leaves_everything_else_alone():
    assert _airflow()(IN_SEASON).get("/ui/other").text == "untouched"
    # Errors (for example not logged in) and compressed replies pass through unchanged.
    assert _airflow(status=401)(IN_SEASON).get("/ui/config").json()["theme"] is None
    res = _airflow(gzip=True)(IN_SEASON).get("/ui/config")
    assert b"globalCss" not in res.content


def test_themes_endpoint_lists_dates():
    from airflow.api_fastapi.core_api.security import get_user

    dagwick_app.dependency_overrides[get_user] = lambda: object()
    try:
        rows = TestClient(dagwick_app).get("/api/themes")
    finally:
        dagwick_app.dependency_overrides.clear()
    if rows.status_code != 200:
        pytest.skip(f"auth override not supported here ({rows.status_code})")
    christmas = next(r for r in rows.json() if r["id"] == "christmas")
    assert christmas["start"] == [12, 18] and christmas["end"] == [1, 2]
    assert isinstance(christmas["active"], bool)


def test_theme_css_endpoint():
    from airflow.api_fastapi.core_api.security import get_user

    dagwick_app.dependency_overrides[get_user] = lambda: object()
    try:
        client = TestClient(dagwick_app)
        ok, missing = client.get("/api/themes/christmas/css"), client.get("/api/themes/nope/css")
    finally:
        dagwick_app.dependency_overrides.clear()
    assert ok.status_code == 200 and set(ok.json()) == {"css", "hide", "reset"}
    assert missing.status_code == 404


def test_halloween_dates_and_scene():
    from dagwick import halloween

    theme = themes.BY_ID["halloween"]
    assert theme.active_on(date(2026, 10, 31)) and theme.active_on(date(2026, 11, 1))
    assert not theme.active_on(date(2026, 11, 2))
    assert pick_theme({}, date(2026, 10, 31)) is theme
    css = halloween.global_css()
    still = css["@media (prefers-reduced-motion: reduce)"]
    for host in ("html::before", '[data-testid="main-content"]::before', "#root::after"):
        assert css[host]["willChange"] == "transform"  # moved by the graphics card
        assert css[host]["pointerEvents"] == "none"
        assert still[host] == {"animation": "none"}
    for host in halloween.BAT_HOSTS:  # each bat flies its own path and flaps at once
        assert "dagwickFlap" in css[host]["animation"]
        assert "steps(4)" in css[host]["animation"]
        assert still[host] == {"animation": "none"}
    shared = css[", ".join(halloween.BAT_HOSTS)]
    assert shared["opacity"] == "0"  # hidden when not animating
    paths = {json.dumps(css[f"@keyframes dagwickBat{i}"]) for i in range(len(halloween.BAT_HOSTS))}
    assert len(paths) == len(halloween.BAT_HOSTS)  # no two bats fly the same way
    assert len(json.dumps(css)) < 100_000


def test_switching_themes_clears_the_old_one_first():
    sheets = themes.theme_sheets("christmas")
    assert '[data-testid="card-list"]{padding-top:0;}' in sheets["reset"]
    assert "!important" not in sheets["reset"]  # so the next theme's rules still win


def test_halloween_puts_branches_on_cards_but_not_on_grade_cards():
    from dagwick import halloween

    css = halloween.global_css()
    assert '[data-testid="card-list"] > *::before' in css
    assert ".dagwick-gcard::before" not in css  # keeps its numbers clear
    assert ".dagwick-gcard" in css  # its spider still hangs from it


def test_halloween_keeps_the_sidebar_clear():
    from dagwick import halloween

    css = halloween.global_css()
    layer = int(css["html::before"]["zIndex"])
    assert int(css['[data-testid="nav-sidebar"]']["zIndex"].split()[0]) > layer
    assert layer < 1400  # Airflow's menus and dialogs stay on top


def test_halloween_decorates_the_sidebar_without_covering_it():
    from dagwick import halloween

    css = halloween.global_css()
    for host in (halloween.SIDEBAR_GLOW, halloween.SIDEBAR_WEB, halloween.SIDEBAR_SPIDER):
        assert host not in halloween.BAT_HOSTS  # each pseudo-element has one job
        assert css[host]["pointerEvents"] == "none"
        assert int(css[host]["left"].rstrip("px")) < halloween.SIDEBAR_W
    # The glow and the web sit behind the icons; the spider hangs at the edge.
    assert css[halloween.SIDEBAR_GLOW]["zIndex"] == css[halloween.SIDEBAR_WEB]["zIndex"] == "-1"
    assert halloween.SIDEBAR_SPIDER in css["@media (prefers-reduced-motion: reduce)"]
    # Removing the theme without a reload hides them too.
    hide = themes.theme_sheets("halloween")["hide"]
    assert all(h in hide for h in (halloween.SIDEBAR_GLOW, halloween.SIDEBAR_SPIDER))


def test_there_is_a_theme_for_every_banner():
    from dagwick.settings import SEASONAL_MOODS

    assert {t.id for t in themes.THEMES} == set(SEASONAL_MOODS)


def test_islamic_calendar_themes_use_their_listed_windows():
    ramadan, eid = themes.BY_ID["ramadan"], themes.BY_ID["eid"]
    assert ramadan.active_on(date(2027, 2, 20)) and not ramadan.active_on(date(2027, 3, 10))
    assert eid.active_on(date(2027, 3, 10)) and eid.active_on(date(2027, 5, 18))
    assert not eid.active_on(date(2027, 4, 1))
    assert ramadan.when(date(2026, 11, 10)) == (
        "About 8 Feb – 9 Mar 2027 · Islamic calendar, moves each year"
    )
    assert ramadan.info(date(2026, 11, 10))["start"] == [2, 8]


def test_fixed_dates_in_words():
    assert themes.BY_ID["christmas"].when(date(2026, 1, 1)) == "18 Dec – 2 Jan · every year"
    assert themes.BY_ID["language-day"].when(date(2026, 1, 1)) == "15 May · every year"


def test_overlapping_themes_show_the_earlier_one():
    # New Year (31 Dec - 2 Jan) falls inside Christmas (18 Dec - 2 Jan).
    assert pick_theme({}, date(2027, 1, 1)).id == "christmas"


def test_banner_only_themes_leave_airflow_untouched():
    info = themes.BY_ID["newroz"].info(date(2026, 3, 20))
    assert info["decorated"] is False and info["active"] is True
    assert themes.BY_ID["christmas"].info(date(2026, 3, 20))["decorated"] is True
    res = _airflow()(date(2026, 3, 20)).get("/ui/config")  # Newroz: banner only
    assert res.json()["theme"] is None


@pytest.mark.parametrize(
    ("theme_id", "day", "active"),
    [
        # Diwali: the five days around Lakshmi Puja.
        ("diwali", date(2027, 10, 27), True),
        ("diwali", date(2027, 10, 31), True),
        ("diwali", date(2027, 11, 1), False),
        ("diwali", date(2028, 10, 17), True),
        ("diwali", date(2029, 11, 5), True),
        ("diwali", date(2030, 10, 26), True),
        ("diwali", date(2031, 11, 14), True),
        # The Lantern Festival: the 15th day of the first Chinese month, one day.
        ("lantern-festival", date(2026, 3, 3), True),
        ("lantern-festival", date(2026, 3, 4), False),
        ("lantern-festival", date(2027, 2, 20), True),
        ("lantern-festival", date(2028, 2, 9), True),
        ("lantern-festival", date(2029, 2, 27), True),
        ("lantern-festival", date(2030, 2, 17), True),
        ("lantern-festival", date(2031, 2, 6), True),
        # Çarşema Sor: the first Wednesday on or after 14 April.
        ("carsema-sor", date(2026, 4, 15), True),
        ("carsema-sor", date(2026, 4, 14), False),
        ("carsema-sor", date(2027, 4, 14), True),
        ("carsema-sor", date(2028, 4, 19), True),
        ("carsema-sor", date(2029, 4, 18), True),
        ("carsema-sor", date(2030, 4, 17), True),
        ("carsema-sor", date(2031, 4, 16), True),
    ],
)
def test_new_festivals_follow_their_calendars(theme_id, day, active):
    assert themes.BY_ID[theme_id].active_on(day) is active


def test_every_carsema_sor_is_a_wednesday_in_mid_april():
    for first, last in themes.CARSEMA_SOR:
        assert first == last and first.weekday() == 2 and first.month == 4
        assert 14 <= first.day <= 20


@pytest.mark.parametrize("theme_id", [t.id for t in themes.THEMES if not t.ready])
def test_coming_soon_themes_are_never_picked(theme_id):
    theme = themes.BY_ID[theme_id]
    assert theme.description == themes.COMING_SOON
    first, _ = theme.next_window(date(2026, 1, 1)) if theme.windows else (None, None)
    day = first or date(2027, *theme.start)
    assert theme.active_on(day)
    assert pick_theme({}, day) is None or pick_theme({}, day).ready  # by date
    assert pick_theme({APPLIED_COOKIE: theme_id}, day) is None or (
        pick_theme({APPLIED_COOKIE: theme_id}, day).id != theme_id
    )  # nor applied by hand


def test_a_theme_that_is_ready_shows_over_one_coming_soon():
    # Diwali 2027 falls during Halloween; Diwali has no Airflow decorations yet.
    assert pick_theme({}, date(2027, 10, 29)).id == "halloween"
    assert pick_theme({}, date(2026, 5, 15)) is None  # Kurdish Language Day: coming soon


def test_new_festivals_name_their_calendar():
    today = date(2026, 11, 11)  # the day after Diwali 2026
    assert themes.BY_ID["diwali"].when(today) == (
        "About 27 Oct – 31 Oct 2027 · Hindu calendar, moves each year"
    )
    assert "Chinese calendar" in themes.BY_ID["lantern-festival"].when(today)


@pytest.mark.parametrize(
    ("path", "root_path", "matches"),
    [
        ("/ui/config", "", True),
        ("/airflow/ui/config", "/airflow", True),  # Airflow under [api] base_url
        ("/plugins/other/ui/config", "", False),  # another app's route with the same ending
        ("/ui/config/extra", "", False),
        ("/ui/configs", "", False),
    ],
)
def test_middleware_only_touches_airflows_own_ui_config_route(path, root_path, matches):
    from dagwick.themes import _is_ui_config

    assert _is_ui_config({"path": path, "root_path": root_path}) is matches

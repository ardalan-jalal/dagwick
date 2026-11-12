"""Check packs: third-party checks loaded through the dagwick.checks entry point."""

from __future__ import annotations

import importlib
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

from dagwick import api, core
from dagwick.core import BUILTIN_PACK, Category, Finding, Status, check, score_dag
from dagwick.settings import Scoring

EXAMPLE_PACK = Path(__file__).parents[1] / "examples" / "dagwick-pack-example"


class FakeEntryPoint:
    def __init__(self, name, load, dist="acme-dagwick-checks"):
        self.name = name
        self.dist = SimpleNamespace(name=dist) if dist else None
        self._load = load

    def load(self):
        return self._load()


@pytest.fixture
def packs(monkeypatch):
    """An empty registry whose entry points are the list this fixture returns."""
    found: list[FakeEntryPoint] = []
    monkeypatch.setattr(core, "_REGISTRY", {})
    monkeypatch.setattr(core, "_plugins_loaded", False)
    monkeypatch.setattr(
        core, "entry_points", lambda group: found if group == "dagwick.checks" else []
    )
    return found


def _register(id_="team_rule"):
    @check(id=id_, title="Team rule", category=Category.OWNERSHIP, weight=4, fix="Do it.")
    def rule(dag):
        return Finding(Status.FAIL, "Not done.")


def test_pack_checks_record_their_distribution(packs):
    packs.append(FakeEntryPoint("acme", _register))
    core.load_plugin_checks()
    assert core._REGISTRY["team_rule"].pack == "acme-dagwick-checks"
    assert core._loading_pack is None


def test_entry_point_name_is_used_without_a_distribution(packs):
    packs.append(FakeEntryPoint("acme", _register, dist=None))
    core.load_plugin_checks()
    assert core._REGISTRY["team_rule"].pack == "acme"


def test_a_pack_that_fails_to_import_is_logged_and_skipped(packs, caplog):
    def broken():
        raise ImportError("No module named 'acme_internal'")

    packs.extend(
        [FakeEntryPoint("broken", broken, dist="broken-pack"), FakeEntryPoint("acme", _register)]
    )
    core.load_plugin_checks()
    assert "Failed to load dagwick checks from entry point broken" in caplog.text
    assert "acme_internal" in caplog.text
    assert list(core._REGISTRY) == ["team_rule"]
    assert core._REGISTRY["team_rule"].pack == "acme-dagwick-checks"
    assert core._loading_pack is None


def test_a_pack_can_override_a_built_in_check_by_id(packs):
    _register("tags")  # stands in for the built-in, registered outside any pack
    assert core._REGISTRY["tags"].pack == __name__.split(".")[0]
    packs.append(FakeEntryPoint("acme", lambda: _register("tags")))
    core.load_plugin_checks()
    assert core._REGISTRY["tags"].pack == "acme-dagwick-checks"
    assert core._REGISTRY["tags"].weight == 4


def test_built_in_checks_belong_to_dagwick():
    built_in = [c for c in core.registered_checks() if c.func.__module__.startswith("dagwick.")]
    assert len(built_in) >= 20
    assert {c.pack for c in built_in} == {BUILTIN_PACK}


def test_reports_and_checks_endpoint_name_the_pack(packs, monkeypatch, dim):
    packs.append(FakeEntryPoint("acme", _register))
    core.load_plugin_checks()
    monkeypatch.setattr(core, "registered_checks", lambda: list(core._REGISTRY.values()))
    monkeypatch.setattr(api, "registered_checks", lambda: list(core._REGISTRY.values()))
    (result,) = score_dag(dim, scoring=Scoring())["checks"]
    assert result["pack"] == "acme-dagwick-checks"
    (listed,) = api.checks()
    assert listed["pack"] == "acme-dagwick-checks"


def test_example_pack_loads_through_its_entry_point(packs, monkeypatch, shining):
    monkeypatch.syspath_prepend(str(EXAMPLE_PACK / "src"))
    module = "dagwick_pack_example.checks"

    def load():
        return (
            importlib.reload(sys.modules[module])
            if module in sys.modules
            else importlib.import_module(module)
        )

    packs.append(FakeEntryPoint("example", load, dist="dagwick-pack-example"))
    core.load_plugin_checks()
    spec = core._REGISTRY["example_team_tag"]
    assert spec.pack == "dagwick-pack-example"
    assert spec.acknowledgeable and spec.ack_hint
    assert spec.func(shining).status == Status.FAIL  # tagged "demo" and "dagwick", no team


def test_example_pack_declares_its_entry_point():
    try:
        import tomllib
    except ImportError:  # Python 3.10
        pytest.skip("tomllib needs Python 3.11")
    data = tomllib.loads((EXAMPLE_PACK / "pyproject.toml").read_text())
    assert data["project"]["entry-points"]["dagwick.checks"] == {
        "example": "dagwick_pack_example.checks"
    }


def test_a_request_during_pack_loading_waits_for_every_pack(packs):
    # A second thread must not see "loaded" while a pack is still importing:
    # it would score with only the built-ins and cache that score.
    import threading

    importing, release = threading.Event(), threading.Event()

    def slow_pack():
        importing.set()
        assert release.wait(5)
        _register()

    packs.append(FakeEntryPoint("acme", slow_pack))
    first = threading.Thread(target=core.load_plugin_checks)
    first.start()
    assert importing.wait(5)
    seen: list[list[str]] = []
    second = threading.Thread(
        target=lambda: seen.append(core.load_plugin_checks() or list(core._REGISTRY))
    )
    second.start()
    second.join(0.2)
    assert second.is_alive()  # waiting for the first thread, not returning early
    release.set()
    first.join(5)
    second.join(5)
    assert seen == [["team_rule"]]


def test_a_pack_that_scores_while_it_imports_does_not_deadlock(packs):
    def reentrant():
        core.load_plugin_checks()  # same thread: returns at once
        _register()

    packs.append(FakeEntryPoint("acme", reentrant))
    core.load_plugin_checks()
    assert list(core._REGISTRY) == ["team_rule"]

from __future__ import annotations

from fastapi.testclient import TestClient

from dagwick import api
from dagwick.api import _ScoreCache, app, fleet_entry
from dagwick.core import score_dag

client = TestClient(app)


def test_static_serves_only_allowlisted_files():
    assert client.get("/static/dagwick.js").status_code == 200
    assert client.get("/static/icon.svg").headers["content-type"].startswith("image/svg")
    assert client.get("/static/icon-dark.svg").headers["content-type"].startswith("image/svg")
    assert client.get("/static/..%2Fapi.py").status_code == 404
    assert client.get("/static/api.py").status_code == 404
    assert client.get("/static/..%2F__init__.py").status_code == 404
    assert client.get("/static/%2E%2E/plugin.py").status_code == 404
    assert client.get("/static/DAGWICK.JS").status_code == 404


def test_static_allowlist_points_at_files_in_the_package():
    for path, _ in api.STATIC_FILES.values():
        assert path.parent == api.STATIC_DIR
        assert path.is_file()


def test_cache_invalidates_when_dag_hash_changes():
    cache = _ScoreCache(max_entries=2)
    cache.put("a", "h1", {"score": 1})
    assert cache.get("a", "h1") == {"score": 1}
    assert cache.get("a", "h2") is None  # DAG changed: re-score


def test_cache_is_bounded():
    cache = _ScoreCache(max_entries=2)
    for i in range(3):
        cache.put(f"d{i}", "h", {"i": i})
    assert cache.get("d0", "h") is None
    assert cache.get("d2", "h") == {"i": 2}


def test_fleet_entry_lists_issues_worst_first(average):
    entry = fleet_entry("demo_average_pipeline", True, "data-team", score_dag(average))
    statuses = [i["status"] for i in entry["issues"]]
    assert statuses == sorted(statuses, key=lambda s: s != "fail")  # fails before warns
    fails = [i for i in entry["issues"] if i["status"] == "fail"]
    assert [i["gain"] for i in fails] == sorted((i["gain"] for i in fails), reverse=True)
    assert entry["is_paused"] is True and entry["owners"] == "data-team"


def test_fleet_entry_lists_tags_sorted(shining):
    entry = fleet_entry("d", False, "", score_dag(shining), tags=["ingest", "daily"])
    assert entry["tags"] == ["daily", "ingest"]
    assert fleet_entry("d", False, "", score_dag(shining))["tags"] == []


def test_fleet_tags_degrade_to_none_when_the_database_fails(monkeypatch):
    from airflow.utils import session as airflow_session

    from dagwick import api

    def broken():
        raise RuntimeError("database is down")

    monkeypatch.setattr(airflow_session, "create_session", broken)
    assert api._fleet_tags(["demo"]) == {}


def test_fleet_entry_for_perfect_dag_has_no_issues(shining):
    assert fleet_entry("demo_shining_pipeline", False, "", score_dag(shining))["issues"] == []


def test_score_unknown_dag_is_404(monkeypatch):
    import pytest
    from fastapi import HTTPException

    from dagwick import api

    monkeypatch.setattr(api, "_score_by_id", lambda dag_id: None)
    with pytest.raises(HTTPException) as err:
        api.score("missing_dag")
    assert err.value.status_code == 404


def test_health_and_history_of_an_unknown_dag_are_404_like_score(monkeypatch):
    import pytest
    from fastapi import HTTPException

    from dagwick import api, health, history

    monkeypatch.setattr(api, "_dag_exists", lambda dag_id: False)
    monkeypatch.setattr(health, "dag_health", lambda dag_id: pytest.fail("read an unknown DAG"))
    monkeypatch.setattr(history, "dag_history", lambda dag_id: pytest.fail("read an unknown DAG"))
    for endpoint in (api.health, api.history):
        with pytest.raises(HTTPException) as err:
            endpoint("missing_dag")
        assert err.value.status_code == 404


def test_health_and_history_of_a_known_dag_are_returned(monkeypatch):
    from dagwick import api, health, history

    monkeypatch.setattr(api, "_dag_exists", lambda dag_id: True)
    monkeypatch.setattr(health, "dag_health", lambda dag_id: {"runs": 0, "success_rate": None})
    monkeypatch.setattr(history, "dag_history", lambda dag_id: {"versions": []})
    assert api.health("demo") == {"runs": 0, "success_rate": None}
    assert api.history("demo") == {"versions": []}


def test_score_errors_never_leak_internals(monkeypatch):
    import pytest
    from fastapi import HTTPException

    from dagwick import api

    def boom(dag_id):
        raise RuntimeError("postgresql://user:secret@db-host/airflow is unreachable")

    monkeypatch.setattr(api, "_score_by_id", boom)
    with pytest.raises(HTTPException) as err:
        api.score("any_dag")
    assert err.value.status_code == 500
    detail = str(err.value.detail)
    assert "secret" not in detail and "db-host" not in detail and "Traceback" not in detail
    assert "ref " in detail  # a reference id the operator can find in the logs


def test_unhandled_errors_return_generic_json():
    import asyncio
    import json

    from dagwick.api import _unhandled

    response = asyncio.run(_unhandled(None, ValueError("internal path /opt/airflow/x.py")))
    body = json.loads(response.body)
    assert response.status_code == 500
    assert "/opt/airflow" not in body["detail"]


def test_score_by_id_uses_cache(monkeypatch, shining):
    from types import SimpleNamespace

    from airflow.models import serialized_dag

    from dagwick import api

    calls = []
    fake = SimpleNamespace(dag_hash="h1", dag=shining)
    monkeypatch.setattr(
        serialized_dag.SerializedDagModel, "get", lambda dag_id: calls.append(1) or fake
    )
    monkeypatch.setattr(api, "_cache", api._ScoreCache())
    monkeypatch.setattr(api, "_dags_per_file", lambda filelocs=None: {shining.fileloc: 1})
    first = api._score_by_id("demo_shining_pipeline")
    second = api._score_by_id("demo_shining_pipeline")
    assert first is second and first["grade"] == "A"
    monkeypatch.setattr(serialized_dag.SerializedDagModel, "get", lambda dag_id: None)
    assert api._score_by_id("gone") is None


def test_score_by_id_serves_a_cached_score_without_loading_the_dag(monkeypatch, shining):
    # The fleet page scores up to FLEET_LIMIT DAGs per request. With a warm cache it
    # must not load and deserialize each DAG again.
    from types import SimpleNamespace

    from airflow.models import serialized_dag

    from dagwick import api

    loads = []
    fake = SimpleNamespace(dag_hash="h1", dag=shining, data=None)
    monkeypatch.setattr(
        serialized_dag.SerializedDagModel, "get", lambda dag_id: loads.append(1) or fake
    )
    monkeypatch.setattr(api, "_cache", api._ScoreCache())
    monkeypatch.setattr(api, "_latest_dag_hash", lambda dag_id: fake.dag_hash)
    first = api._score_by_id("demo", 1, (None, None))
    second = api._score_by_id("demo", 1, (None, None))
    assert first is second and loads == [1]

    fake.dag_hash = "h2"  # a new version is parsed: load and score it once
    third = api._score_by_id("demo", 1, (None, None))
    assert third is not first and loads == [1, 1]


def test_score_by_id_scores_the_version_it_loaded_when_one_lands_mid_request(monkeypatch, shining):
    from types import SimpleNamespace

    from airflow.models import serialized_dag

    from dagwick import api

    fake = SimpleNamespace(dag_hash="h1", dag=shining, data=None)
    monkeypatch.setattr(serialized_dag.SerializedDagModel, "get", lambda dag_id: fake)
    monkeypatch.setattr(api, "_cache", api._ScoreCache())
    hashes = iter(["h1", "h1"])
    monkeypatch.setattr(api, "_latest_dag_hash", lambda dag_id: next(hashes))
    api._score_by_id("demo", 1, (None, None))  # remembers the sensors of h1
    fake.dag_hash = "h2"  # lands after the hash read, before the load
    api._score_by_id("demo", 2, (None, None))  # a cache miss, so the DAG is loaded
    keys = [k for k, _ in api._cache._data.values()]
    assert keys and keys[0].startswith("h2:2:")


def test_latest_dag_hash_is_none_when_the_database_fails(monkeypatch):
    from airflow.utils import session as airflow_session

    from dagwick import api

    def boom():
        raise RuntimeError("database is down")

    monkeypatch.setattr(airflow_session, "create_session", boom)
    assert api._latest_dag_hash("demo") is None


def test_score_by_id_rescores_when_the_files_dag_count_changes(monkeypatch, shining):
    from types import SimpleNamespace

    from airflow.models import serialized_dag

    from dagwick import api

    fake = SimpleNamespace(dag_hash="h1", dag=shining)
    monkeypatch.setattr(serialized_dag.SerializedDagModel, "get", lambda dag_id: fake)
    monkeypatch.setattr(api, "_cache", api._ScoreCache())
    single = api._score_by_id("demo_shining_pipeline", dags_in_file=1)
    factory = api._score_by_id("demo_shining_pipeline", dags_in_file=4)
    status = {c["id"]: c["status"] for c in factory["checks"]}
    assert single is not factory and status["file_name"] == "skip"


def test_score_by_id_rescores_when_source_or_parse_band_changes(monkeypatch, shining):
    from types import SimpleNamespace

    from airflow.models import serialized_dag

    from dagwick import api

    sources = []
    fake = SimpleNamespace(dag_hash="h1", dag=shining)
    monkeypatch.setattr(serialized_dag.SerializedDagModel, "get", lambda dag_id: fake)
    monkeypatch.setattr(api, "_cache", api._ScoreCache())
    monkeypatch.setattr(api, "_source", lambda dag_id: sources.append(dag_id) or "X = 1\n")

    first = api._score_by_id("demo", 1, ("hash-a", 1.0))
    same_band = api._score_by_id("demo", 1, ("hash-a", 2.0))
    new_source = api._score_by_id("demo", 1, ("hash-b", 2.0))
    slow = api._score_by_id("demo", 1, ("hash-b", 6.0))

    assert first is same_band
    assert new_source is not first and slow is not new_source
    assert {c["id"]: c["status"] for c in slow["checks"]}["parse_time"] == "warn"
    assert sources == ["demo", "demo", "demo"]


def test_score_by_id_does_not_read_source_without_a_hash(monkeypatch, shining):
    from types import SimpleNamespace

    import pytest
    from airflow.models import serialized_dag

    from dagwick import api

    fake = SimpleNamespace(dag_hash="h1", dag=shining)
    monkeypatch.setattr(serialized_dag.SerializedDagModel, "get", lambda dag_id: fake)
    monkeypatch.setattr(api, "_cache", api._ScoreCache())
    monkeypatch.setattr(api, "_source", lambda dag_id: pytest.fail("source read"))
    report = api._score_by_id("demo", 1, (None, None))
    statuses = {c["id"]: c["status"] for c in report["checks"]}
    assert statuses["parse_time_variables"] == statuses["parse_time"] == "skip"


def test_file_facts_and_source_degrade_to_unknown_when_the_database_fails(monkeypatch):
    from airflow.utils import session as airflow_session

    from dagwick import api

    def broken():
        raise RuntimeError("database is down")

    monkeypatch.setattr(airflow_session, "create_session", broken)
    assert api._file_facts(["demo"]) == {}

    from airflow.models.dagcode import DagCode

    monkeypatch.setattr(DagCode, "code", classmethod(lambda cls, dag_id: broken()))
    assert api._source("demo") is None


def test_fleet_entry_carries_tags(average):
    entry = fleet_entry("demo_average_pipeline", False, "", score_dag(average), tags=["b", "a"])
    assert entry["tags"] == ["a", "b"]  # sorted, so the CSV and filters are stable
    assert fleet_entry("x", False, "", score_dag(average))["tags"] == []


def test_fleet_tags_groups_by_dag(monkeypatch):
    from contextlib import contextmanager

    from airflow.utils import session as airflow_session

    from dagwick import api

    class FakeSession:
        def execute(self, query):
            assert "dag_tag" in str(query)
            return type(
                "R", (), {"all": lambda self: [("a", "finance"), ("a", "team:data"), ("b", "x")]}
            )()

    @contextmanager
    def fake_session():
        yield FakeSession()

    monkeypatch.setattr(airflow_session, "create_session", fake_session)
    assert api._fleet_tags(["a", "b", "c"]) == {"a": ["finance", "team:data"], "b": ["x"]}


def test_dag_exists_asks_the_serialized_dag_table(monkeypatch):
    from airflow.models.serialized_dag import SerializedDagModel

    from dagwick import api

    known = classmethod(lambda cls, dag_id: dag_id == "demo")
    monkeypatch.setattr(SerializedDagModel, "has_dag", known)
    assert api._dag_exists("demo") is True
    assert api._dag_exists("missing_dag") is False

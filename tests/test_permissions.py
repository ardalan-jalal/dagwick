"""Dagwick asks Airflow for the same DAG sub-permissions core Airflow does.

Core Airflow shows a DAG's source only with "DAG Code", its runs with "DAG Runs", task
instances with "Task Instances" and versions with "DAG Versions". Dagwick's endpoints
derive data from all of these, so a user lacking one must not get it through Dagwick.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from dagwick import api


class _AuthManager:
    """Allows plain DAG read; allows a sub-permission only if it is in `granted`."""

    def __init__(self, granted: set[str]):
        self.granted = granted
        self.asked: list[str | None] = []

    def is_authorized_dag(self, *, method, access_entity=None, details=None, user=None):
        name = access_entity.name if access_entity is not None else None
        self.asked.append(name)
        return name is None or name in self.granted


@pytest.fixture
def client(monkeypatch):
    from airflow.api_fastapi.core_api import security
    from airflow.models import DagModel

    def make(granted: set[str]) -> tuple[TestClient, _AuthManager]:
        manager = _AuthManager(granted)
        monkeypatch.setattr(security, "get_auth_manager", lambda: manager)
        monkeypatch.setattr(DagModel, "get_team_name", staticmethod(lambda dag_id: None))
        api.app.dependency_overrides[security.get_user] = lambda: object()
        return TestClient(api.app), manager

    yield make
    api.app.dependency_overrides.clear()


@pytest.mark.parametrize(
    ("path", "needs"),
    [
        ("/api/score", {"CODE", "TASK_INSTANCE"}),
        ("/api/history", {"CODE", "VERSION"}),
        ("/api/health", {"RUN", "TASK_INSTANCE"}),
    ],
)
def test_each_dag_endpoint_needs_the_sub_permissions_for_its_data(client, monkeypatch, path, needs):
    name = path.rsplit("/", 1)[1]
    assert set(api.NEEDS[name]) == needs
    monkeypatch.setattr(api, "_dag_exists", lambda dag_id: True)
    monkeypatch.setattr(api, "_score_by_id", lambda dag_id: {"dag_id": dag_id})
    from dagwick import health, history

    monkeypatch.setattr(health, "dag_health", lambda dag_id: {"runs": 0})
    monkeypatch.setattr(history, "dag_history", lambda dag_id: {"versions": []})

    for missing in needs:  # without any one of them: forbidden
        c, manager = client(needs - {missing})
        assert c.get(path, params={"dag_id": "x"}).status_code == 403, missing
    c, manager = client(needs)  # with all of them: allowed
    assert c.get(path, params={"dag_id": "x"}).status_code == 200
    assert None in manager.asked  # plain DAG read is still checked too


def test_fleet_needs_code_runs_and_task_instances(client, monkeypatch):
    assert set(api.NEEDS["fleet"]) == {"CODE", "RUN", "TASK_INSTANCE"}
    c, _ = client({"RUN", "TASK_INSTANCE"})  # no "DAG Code"
    assert c.get("/api/fleet").status_code == 403


def test_a_sub_permission_this_airflow_lacks_is_skipped(monkeypatch):
    from airflow.api_fastapi.core_api import security

    asked = []
    monkeypatch.setattr(
        security,
        "requires_access_dag",
        lambda method, access_entity=None: asked.append(access_entity) or (lambda: None),
    )
    deps = api._require_dag_read("CODE", "NOT_IN_THIS_AIRFLOW")
    assert len(deps) == 2  # plain DAG read + CODE
    assert asked[0] is None and asked[1].name == "CODE"
    assert len(api._require_dag_read("RUN", dag=False)) == 1

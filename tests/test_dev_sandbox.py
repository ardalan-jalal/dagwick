from pathlib import Path


def test_the_sandbox_is_only_reachable_from_this_machine():
    # Everyone who can reach the sandbox is an admin (no login), so it must not listen
    # on the network.
    run = (Path(__file__).parents[1] / "dev" / "run.sh").read_text()
    assert "SIMPLE_AUTH_MANAGER_ALL_ADMINS=True" in run
    assert "export AIRFLOW__API__HOST=127.0.0.1" in run

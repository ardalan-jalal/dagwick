#!/usr/bin/env bash
# Start a throwaway Airflow on http://localhost:${PORT:-8080} with Dagwick installed.
# Everything lives in dev/airflow_home; delete that folder to start fresh.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

(cd ui && npm run build --silent)
uv sync --quiet   # dev group: Airflow + Dagwick (editable)

export AIRFLOW_HOME="$ROOT/dev/airflow_home"
export AIRFLOW__CORE__DAGS_FOLDER="$ROOT/dev/dags"
export AIRFLOW__CORE__LOAD_EXAMPLES=False
export AIRFLOW__API__PORT="${PORT:-8080}"
# Only this machine can reach the sandbox: everyone who can reach it is an admin.
export AIRFLOW__API__HOST=127.0.0.1
# Local sandbox only: skip the login screen. Never set this in a real deployment.
export AIRFLOW__CORE__SIMPLE_AUTH_MANAGER_ALL_ADMINS=True
export AIRFLOW__DAG_PROCESSOR__REFRESH_INTERVAL=10

export PATH="$ROOT/.venv/bin:$PATH"
exec airflow standalone

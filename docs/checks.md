# Checks

Each DAG gets a score from 0 to 100 and a grade: **A** ≥ 90, **B** ≥ 75,
**C** ≥ 60, **D** ≥ 40, otherwise **F**. A check that only partly passes (for
example, 2 of 3 tasks have a timeout) earns half its points. A check that does
not apply to a DAG is left out of the score.

| Category | Check | Points |
| --- | --- | --- |
| Reliability | Tasks retry on failure | 15 |
| Reliability | Tasks have a time limit (`execution_timeout`) | 10 |
| Reliability | Runs have a time limit (`dagrun_timeout`) | 8 |
| Observability | Someone hears about failures (`on_failure_callback`) | 15 |
| Observability | Retries are visible (`on_retry_callback`) | 3 |
| Ownership | Has a real owner (not the default `airflow`) | 8 |
| Ownership | Documented (`doc_md`) | 8 |
| Ownership | Tagged | 5 |
| Scheduling | Has a schedule | 5 |
| Scheduling | No surprise backfills (`catchup`) | 5 |
| Scheduling | Stops after repeated failures (`max_consecutive_failed_dag_runs`) | 3 |
| Scheduling | Bounded parallel runs (`max_active_runs`) | 5 |
| Structure | Split into steps | 5 |
| Structure | Consistent names (snake_case) | 3 |
| Structure | File named after the DAG (`<dag_id>.py`; skipped for files that define several DAGs) | 3 |
| Structure | Uses current Airflow imports (no path Airflow itself marks as deprecated) | 3 |
| Performance | Fast to parse (warn from 5 s, fail from 20 s) | 5 |
| Performance | No `Variable.get` at parse time (top level, default args, decorator arguments) | 5 |

## Add your own check

```python
# my_checks/rules.py
from dagwick import Category, Finding, Status, check


@check(
    id="team_tag",
    title="Has a team tag",
    category=Category.OWNERSHIP,
    weight=5,
    fix="Add a tag like 'team:data'.",
    example='DAG(..., tags=["team:data"])',
)
def team_tag(dag):
    if any(t.startswith("team:") for t in dag.tags):
        return Finding(Status.PASS, "Team tag present.")
    return Finding(Status.FAIL, "No team tag.")
```

Register the module in your package's `pyproject.toml`, then install that
package next to Dagwick:

```toml
[project.entry-points."dagwick.checks"]
my_checks = "my_checks.rules"
```

A check with the same `id` as a built-in check replaces it.

A check can also take a second parameter, `context` (a `dagwick.Context`), for
facts that are not on the DAG itself: `context.dags_in_file`, `context.source`
(the DAG file's source code, as Airflow stored it) and `context.parse_seconds`
(how long the file last took to parse). Each is `None` when unknown.

Checks that read the source never run it: they read it with Python's `ast`
module. Deprecated import paths come from Airflow's own deprecation table, so
the check follows whichever Airflow version is installed.

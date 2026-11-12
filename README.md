# Dagwick

[![PyPI](https://img.shields.io/pypi/v/dagwick?color=a99aff)](https://pypi.org/project/dagwick/) ![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776ab?logo=python&logoColor=white) [![CI](https://github.com/dagwick/dagwick/actions/workflows/ci.yml/badge.svg)](https://github.com/dagwick/dagwick/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-2f9e6e)](https://github.com/dagwick/dagwick/blob/main/LICENSE) [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/dagwick/dagwick/badge)](https://scorecard.dev/viewer/?uri=github.com/dagwick/dagwick) [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/16521/badge)](https://www.bestpractices.dev/projects/16521)

![Dagwick: grade your Airflow DAGs from A to F, right inside the Airflow UI](https://raw.githubusercontent.com/dagwick/dagwick/main/docs/banner.png)

![Dagwick in 15 seconds: a DAG's Dagwick tab with its score, run health and score history, then the fleet page filtered by a common issue](https://raw.githubusercontent.com/dagwick/dagwick/main/docs/demo.gif)

## Setup

**1. Install** it where Airflow runs:

```bash
pip install dagwick
```

Using Docker? Add `dagwick` to your Airflow image's `requirements.txt`.

**2. Restart** the Airflow api-server.

**3. Open Airflow.** You now have:

- a **Dagwick** tab on every DAG page, and
- a **Dagwick** page in the sidebar that grades all your DAGs.

That's it. There is nothing to configure. If you want to, you can turn checks
off, change their weights or move the grade thresholds in `airflow.cfg`
([tune the scoring](https://github.com/dagwick/dagwick/blob/main/docs/checks.md#tune-the-scoring)).

## What you get

- **A score and a grade for every DAG.** 20 checks in 7 categories:
  reliability, observability, ownership, scheduling, structure, performance
  and security. Each check that doesn't pass tells you how to fix it. See
  [what it checks](https://github.com/dagwick/dagwick/blob/main/docs/checks.md).
- **Checks that read your DAG file without running it:** `Variable.get` at
  parse time, deprecated Airflow imports, hard-coded secrets (the value is
  never shown), and sensors that hold a worker slot while they wait.
- **Run health** next to the score: success rate, retries, typical run time
  and its trend over the last 30 days. It never changes the score.
- **Score history:** the score of each of the last 20 versions of a DAG, and
  which checks started or stopped passing at each step.
- **A fleet page** that grades all the DAGs you can see and shows the most
  common issues. **Download CSV** saves the DAGs shown (dag_id, owners, tags,
  score, grade, failing and warning checks, runs and success rate over 30
  days). The file is built in your browser from what you are allowed to see.
  To put the same data in a dashboard, see
  [Fleet data in a dashboard](https://github.com/dagwick/dagwick/blob/main/docs/dashboards.md).
- **`dagwick check` and a pre-commit hook** to grade DAG files before they are
  merged. See [Check DAGs before they are merged](#check-dags-before-they-are-merged).
- **Break a check on purpose, with a reason.** Some DAGs need `catchup=True`
  or no retries. See [Acknowledge a check on purpose](#acknowledge-a-check-on-purpose).
- **Your own rules as a check pack:** a separate package that adds checks
  through an entry point. See
  [Write a check pack](https://github.com/dagwick/dagwick/blob/main/docs/checks.md#write-a-check-pack).

Wick, the little flame, dresses up for holidays like Newroz, Eid, Çarşema Sor,
Diwali, Christmas and Halloween ([seasonal moods](https://github.com/dagwick/dagwick/blob/main/docs/moods.md)).

![The Dagwick tab on a DAG](https://raw.githubusercontent.com/dagwick/dagwick/main/docs/screenshots/dag-tab.png)

![The Dagwick fleet page](https://raw.githubusercontent.com/dagwick/dagwick/main/docs/screenshots/fleet.png)

## Acknowledge a check on purpose

Some DAGs break a check for a good reason: an ingest DAG uses `catchup=True` to
backfill the days it missed during an outage, or a task that inserts without
de-duplicating must never retry. Tell Dagwick with a comment in the DAG file:

```python
# dagwick: ack <check> -- <reason>
```

For example:

```python
DAG(
    "daily_ingest",
    catchup=True,  # dagwick: ack catchup -- backfills one file per missed day
    default_args={"retries": 0},  # dagwick: ack retries -- inserts are not idempotent
)
```

After Airflow parses the file again, the check is shown greyed out with your
reason, and it no longer counts toward the score. It is never hidden, and the
fleet page counts it as "acknowledged". To score the check again, delete the
comment.

- Put the comment anywhere in the file. It applies to every DAG in that file.
- One comment can name several checks: `# dagwick: ack retries, catchup -- <reason>`.
- The reason after `--` is required. Without it the comment is ignored.
- Dagwick reads the comment from the DAG's source code; it never runs the file.

**Checks you can acknowledge** (use the id in the comment):

| Check | Id | The reason must say |
| --- | --- | --- |
| Tasks retry on failure | `retries` | why the DAG breaks it on purpose |
| Retries are visible | `retry_alerts` | why the DAG breaks it on purpose |
| Has a schedule | `schedule` | why the DAG breaks it on purpose |
| No surprise backfills | `catchup` | why the DAG breaks it on purpose |
| Bounded parallel runs | `max_active_runs` | why the DAG breaks it on purpose |
| Split into steps | `decomposition` | why the DAG breaks it on purpose |
| Someone hears about failures | `failure_alerts` | where failures are alerted instead, e.g. a central listener or a Grafana rule |
| Stops after repeated failures | `auto_pause` | what stops the DAG when it keeps failing, e.g. on-call pausing it by hand |
| Sensors free their worker slot | `sensor_slots` | why the sensor must keep its worker slot, e.g. it needs sub-minute reaction |

Every other check (owner, docs, tags, timeouts, naming, file name, imports,
parse time, `Variable.get` and secrets) **can't be acknowledged**: each one
protects something every DAG needs. A comment for one of them is ignored, and
the Dagwick tab says so. Run `./dev/run.sh` from a clone of this repository to
see a demo DAG (`demo_acknowledged_ingest`) with every case.

## Check DAGs before they are merged

`dagwick check` grades DAG files with the same checks as the UI and can fail a
pull request below a chosen grade:

```bash
dagwick check dags/ --min-grade C     # exit 1 if any DAG is below C
dagwick check dags/my_dag.py --json   # machine-readable report
```

It needs Airflow installed next to it, and it **imports the DAG files**, so
their top-level code runs, the same as in Airflow's DAG processor. Use it on a
developer machine or in CI. The Airflow plugin itself never runs DAG code.

Exit codes: `0` all good, `1` a DAG is below `--min-grade`, `2` a file failed
to load.

### pre-commit

```yaml
- repo: https://github.com/dagwick/dagwick
  rev: v0.2.0
  hooks:
    - id: dagwick
      args: [--min-grade, C]   # default: D
```

The hook uses `language: system`, so run pre-commit from an environment where
Airflow and Dagwick are installed.

## Requirements

- Apache Airflow 3.1 or newer
- Python 3.10 – 3.15

Dagwick has no dependencies of its own, so installing it never changes your
other packages. It is read-only and only shows each user the DAGs they can
already see.

### Permissions

Airflow only shows plugin pages to users who may read the list of plugins.
With the FAB auth manager (`apache-airflow-providers-fab`), the **Admin** and
**Op** roles can do that, but **Viewer** and **User** cannot. For them the
Dagwick tab and sidebar page are missing, and `/plugin/dagwick-fleet` shows
Airflow's "page not found". Dagwick is not broken; give the role that
permission:

```bash
airflow roles add-perms Viewer -a can_read -r Plugins
airflow roles add-perms User -a can_read -r Plugins
```

Users still only see the DAGs they may read. With another auth manager, give
the same users read access to plugins in that manager.

Dagwick also asks for the same DAG sub-permissions Airflow itself requires for
the data behind each grade. A role without them gets "Forbidden" instead of
that DAG's grade:

| Page | Needs read on the DAG, plus |
| --- | --- |
| Score on the DAG tab | DAG Code, Task Instances |
| Score history | DAG Code, DAG Versions |
| Run health | DAG Runs, Task Instances |
| Fleet page | DAG Code, DAG Runs, Task Instances |

Airflow's built-in roles normally include these; check any custom roles.
With the default SimpleAuthManager there is nothing to set.

## Verify a release

From 0.3.0, every release is built and signed by the release workflow in this
repository. To check that the wheel you install is the one it built:

```bash
pip download dagwick==0.3.0 --no-deps -d dagwick-download
gh attestation verify dagwick-download/*.whl -R ardalan-jalal/dagwick
```

Releases up to 0.3.x were signed before the repository moved to the
`dagwick` organization, so they verify against `ardalan-jalal/dagwick` as
above. Later releases verify with `-R dagwick/dagwick`.

The GitHub release also carries a Sigstore bundle (`.sigstore.json`) for the
wheel and the sdist. See
[Releasing](https://github.com/dagwick/dagwick/blob/main/RELEASING.md#verify-a-release)
for how to check those.

## Remove

```bash
pip uninstall dagwick
```

Then restart the api-server.

## More

- [Seasonal moods, and how to turn them off](https://github.com/dagwick/dagwick/blob/main/docs/moods.md)
- [Seasonal themes for all of Airflow, config only](https://github.com/dagwick/dagwick/blob/main/themes/README.md)
- [What it checks, and how to add your own checks](https://github.com/dagwick/dagwick/blob/main/docs/checks.md)
- [Roadmap](https://github.com/dagwick/dagwick/blob/main/ROADMAP.md)
- [Security](https://github.com/dagwick/dagwick/blob/main/SECURITY.md) · [Contributing](https://github.com/dagwick/dagwick/blob/main/CONTRIBUTING.md) · [Changelog](https://github.com/dagwick/dagwick/blob/main/CHANGELOG.md) · [Releasing](https://github.com/dagwick/dagwick/blob/main/RELEASING.md)
- License: [MIT](https://github.com/dagwick/dagwick/blob/main/LICENSE)

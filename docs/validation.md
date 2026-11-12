# Validating Dagwick on a real deployment

A kit for [issue #33](https://github.com/ardalan-jalal/dagwick/issues/33): run
Dagwick on a real (non-demo) Airflow 3 deployment, review the grades with DAG
owners, report false alarms and propose weight changes.

**Keep real data out of this repository and out of public issues.** DAG names,
owners, code, connection names and variables stay on your machine. Issues get a
minimal DAG written from scratch that shows the same problem.

## 1. Install and record the setup

```bash
pip install "dagwick==0.2.0"   # into the api-server's environment, then restart it
```

Write down: the Airflow version, the Dagwick version (the footer of the
Dagwick page, or `GET /api/v2/plugins`), the number of active DAGs, and any
`[dagwick]` settings.

## 2. Time the fleet page

Get an API token (`POST /auth/token`, or copy it from the UI's session) and run:

```bash
AIRFLOW_TOKEN=... python scripts/fleet_review.py time https://airflow.example.com --runs 3 --save fleet.json
```

Run 1 is "cold" only if the api-server was restarted just before: Dagwick keeps
scores in memory and re-scores a DAG only when its code changes. Report both
numbers, and the DAG count.

To see how it scales past your deployment, use the sandbox with generated DAGs:

```bash
DAGWICK_LOAD_TEST_DAGS=500 ./dev/run.sh
```

Wait until the DAG processor has parsed them all (the DAG list shows the count),
restart once so the cache is cold, then time `http://localhost:8080`.

## 3. Review the grades with 2–3 DAG owners

Make a review sheet with one row per finding:

```bash
python scripts/fleet_review.py sheet fleet.json --owner data-team > review.csv
```

Go through it with the owner (about 30 minutes each). For each row, fill in
**verdict**:

| Verdict | Meaning | What to do |
| --- | --- | --- |
| useful | Right, and worth fixing. | Nothing for Dagwick. |
| false alarm | The check is wrong about this DAG. | Open a [dispute](https://github.com/ardalan-jalal/dagwick/issues/new?template=dispute.yml) and pick "False alarm". |
| noise | Right, but the owner broke the rule on purpose, or it doesn't matter here. | If the check can be acknowledged, suggest `# dagwick: ack <check> -- <reason>`. If it can't, or this happens on many DAGs, note it for a weight change. |

Questions to ask each owner:

- Which grade surprised you, and why?
- Does the top issue for each DAG match what you would fix first?
- Did any finding make you want to change your DAG today?

## 4. Propose weight changes

From the sheets, count each check's verdicts. A check with mostly "noise" is
over-weighted; a check whose failures caused real incidents is under-weighted.
Propose each change as `check_id: old -> new` with a one-line reason. Admins can
try a change without a release: `[dagwick] weights = retries:10`.

## 5. Report back on #33

Post a short comment on #33 with counts only, no names:

```markdown
**Deployment:** Airflow X.Y.Z, Dagwick X.Y.Z, N active DAGs, M owners.
**Fleet page:** N DAGs in X s cold, Y s warm. Sandbox: 500 DAGs in X s cold.
**Grades:** A: n, B: n, C: n, D: n, F: n.
**Reviewed with:** k owners, j DAGs, f findings.
**Verdicts:** useful n, false alarm n, noise n.
**False alarms:** #NN, #NN.
**Weight proposals:**
- `check_id: 15 -> 10`: reason.
```

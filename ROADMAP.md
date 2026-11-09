# Roadmap

Where Dagwick is heading. Priorities can change; ideas and feedback are welcome
in [issues](https://github.com/ardalan-jalal/dagwick/issues).

## 1. Prove it on real DAGs (0.1.x)

- [ ] **Validate on real Airflow deployments.** Review grades with DAG owners,
      fix false alarms, and tune the weights.
- [ ] **Acknowledge a check on purpose.** Let a DAG mark a check as intentional
      (for example `catchup=True` for a backfill DAG) instead of losing points
      forever.
- [ ] **Optional settings without code.** A `[dagwick]` section in
      `airflow.cfg` to turn checks off, change weights and set grade thresholds.
      Still read-only, still no secrets.
- [ ] **Test against several Airflow versions** (3.1, 3.2, 3.3) in CI.

## 2. Make it more useful (0.2)

- [ ] **`dagwick check dags/` command and pre-commit hook.** Grade DAGs before
      they are merged, and fail a pull request when a DAG scores below a chosen
      grade.
- [ ] **Score history.** Airflow 3 keeps every DAG version, so Dagwick can score
      past versions and show a trend, without storing anything itself.
- [ ] **Real-world health next to code quality.** Recent success rate, retry
      frequency and duration trends, read from the runs Airflow already records.
- [ ] **More checks:**
  - [x] `Variable.get` at the top level of a DAG file (slows every parse)
  - [ ] sensors that hold a worker slot instead of using `reschedule` mode or a
        deferrable operator (needs run history: the serialized DAG does not keep
        a sensor's `mode` or `deferrable`)
  - [x] deprecated operators (any import path Airflow marks as deprecated)
  - [ ] hard-coded secrets in DAG code
  - [x] slow DAG parse times

- [x] **Seasonal moods, experimental and off by default** (0.2.0): Newroz, Eid, Kurdish Language Day, Christmas,
      New Year, Halloween, Ramadan and Dagwick's birthday.
- [ ] **Make seasonal moods production-ready** and turn them on by default.
- [ ] **Airflow-wide seasonal themes** (config only, `themes/`): realistic snow,
      then Halloween, Newroz and Kurdish Language Day.
- [ ] **More moods:** the Lantern Festival, Diwali, Yazidi New Year
      (Çarşema Sor).

## 3. Grow it (0.3+)

- [ ] **Check packs.** Team- or company-specific rules shipped as separate
      packages through the existing `dagwick.checks` entry point, so Dagwick
      itself stays generic.
- [ ] **Exports.** Download the fleet as CSV, or expose scores as metrics for
      dashboards.
- [ ] **Fleet views by owner and tag**, so each team sees its own DAGs.

## Project health (ongoing)

- [x] Signed releases to PyPI with Trusted Publishing
- [x] Dependabot for Python, npm and GitHub Actions
- [ ] CodeQL scanning and an OpenSSF Scorecard badge
- [ ] A short demo GIF in the README
- [ ] **1.0** once the check interface is stable, so check-pack authors can rely
      on it

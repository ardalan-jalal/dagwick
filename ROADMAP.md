# Roadmap

What Dagwick plans to do, and not do, from **November 2026 to November 2027**.
Priorities can change; ideas and feedback are welcome in
[issues](https://github.com/dagwick/dagwick/issues) and
[discussions](https://github.com/dagwick/dagwick/discussions). The maintainers
review this page at least every three months (see [GOVERNANCE.md](GOVERNANCE.md)).

## Next 12 months

### Trust the grades (late 2026 – early 2027)

- [ ] **Validate on real Airflow deployments.** Review grades with DAG owners,
      fix false alarms and tune the weights (the [validation kit](docs/validation.md)).
- [ ] **Act on disputes.** Every
      [Dispute a check](https://github.com/dagwick/dagwick/issues/new?template=dispute.yml)
      report gets an answer, and the rules or weights change when it is right.
- [ ] **Publish the reasoning behind each check** in [docs/checks.md](docs/checks.md),
      so teams can see why a rule exists before they argue with it.

### Make it part of the workflow (2027)

- [ ] **1.0**, once the check interface is stable, so check-pack authors can
      rely on it.
- [ ] **Scores as metrics** for dashboards, next to the existing CSV download.
- [ ] **More built-in themes:** Newroz, Kurdish Language Day, Eid, Ramadan and
      New Year (now "Coming soon" on the Themes page).
- [ ] **Translations of the UI**, starting with Kurdish.

### Project health (ongoing)

- [ ] OpenSSF Best Practices **silver** badge.
- [ ] Keep CI green on every supported Airflow 3 minor version as new ones come
      out.

## What Dagwick will not do

These follow from the rules in [GOVERNANCE.md](GOVERNANCE.md#non-negotiables)
and will not change in the next year:

- **No writing to Airflow.** Dagwick will not change DAGs, pause them, open
  pull requests or store data in Airflow's database.
- **No runtime dependencies** and **no network calls** (no telemetry, no
  remote rules, no AI service).
- **No running DAG code inside Airflow.** Only the optional `dagwick check`
  command imports DAG files, on the user's own machine or CI.
- **No Airflow 2 support.** Dagwick needs Airflow 3.1 or later.
- **No standalone server or SaaS.** Dagwick is a plugin inside Airflow.
- **No company-specific rules in Dagwick itself.** Those belong in
  [check packs](docs/checks.md#write-a-check-pack).

## Done

- [x] Grades A–F on a DAG tab and a fleet page (0.1.0)
- [x] Test against several Airflow versions in CI (0.1.0)
- [x] Acknowledge a check on purpose (0.2.0)
- [x] `dagwick check` command and pre-commit hook (0.2.0)
- [x] Score history and real-world run health (0.2.0)
- [x] Checks for `Variable.get` at parse time, sensors holding worker slots,
      deprecated imports, hard-coded secrets and slow parsing (0.2.0)
- [x] Optional `[dagwick]` settings: turn checks off, change weights and grade
      thresholds (0.3.0)
- [x] Check packs through the `dagwick.checks` entry point (0.3.0)
- [x] Fleet CSV download (0.3.0) and fleet filters by owner and tag
- [x] Seasonal moods, on by default (0.3.0)
- [x] Airflow-wide seasonal themes: config-only files, and built in for
      Christmas and Halloween (0.3.0)
- [x] Signed releases to PyPI with Trusted Publishing, Dependabot, CodeQL,
      fuzzing and an OpenSSF Scorecard badge
- [x] OpenSSF Best Practices passing badge

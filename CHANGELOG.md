# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - unreleased

### Added

- **Seasonal moods (experimental, off by default).** During holidays the lantern dresses up and the page
  header gets an animated scene: falling snow at Christmas, bats at Halloween,
  bonfires and govend dancers at Newroz, Kurdish letters on Kurdish Language
  Day, lanterns at Ramadan, kulîçe at Eid, fireworks at New Year. Each mood
  shows a short English greeting. Decoration only: scores never change.
- One optional, non-secret setting: `[dagwick] seasonal_moods`
  (`off` by default | `auto` | a list of moods). Viewers can also hide moods for themselves.
- Preview any mood with `?dagwick_mood=<id>`.
- New check, **File named after the DAG**: warns when a DAG's file is not
  `<dag_id>.py`, so the code is easy to find from the DAG name. Files that
  define several DAGs (DAG factories) are skipped.
- Checks can take an optional second parameter, `context`, with facts that
  are not on the DAG itself (for example how many DAGs share its file).
- New checks that read the DAG file's source as Airflow stored it, without
  running it: **No `Variable.get` at parse time** and **Uses current Airflow
  imports** (paths Airflow itself marks as deprecated, with the new location).
- New check, **Fast to parse**: warns from 5 s and fails from 20 s, using the
  parse time Airflow records for each file.
- New category, **Performance**.
- `Context` gains `source` and `parse_seconds`.

## [0.1.0] - 2026-11-08

### Added

- **Dagwick tab** on every DAG page: a score from 0 to 100, a grade from A to F,
  a lantern mascot, the next step to the next grade, the affected tasks, and a
  fix with a copyable code example for every check that does not pass.
- **Fleet page** in the Airflow sidebar: every DAG the user can read, ranked by
  score, with grade filters, search, sort, and the most common issues.
- 14 built-in checks covering reliability, observability, scheduling,
  ownership and structure.
- `dagwick.checks` entry point so other packages can add or override checks.
- Scores reuse Airflow's own permission checks and are cached per DAG version.

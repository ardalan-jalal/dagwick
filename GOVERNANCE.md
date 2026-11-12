# Governance

Dagwick is a small project run by its maintainers. This page says how
decisions are made, who does what, and how the project keeps going if someone
steps away.

## How decisions are made

- **Everyday changes** are decided in pull requests. A change is merged when CI
  passes and a maintainer other than the author approves it (see
  [CONTRIBUTING.md](CONTRIBUTING.md)).
- **Bigger changes**, such as a new check, a change to scoring, a new setting or
  anything that affects the [non-negotiables](#non-negotiables), start as an
  issue so that users and maintainers can comment before code is written.
- **Lazy consensus:** if no maintainer objects within a few days, the proposal
  goes ahead.
- **Disagreements** are settled by a vote of the maintainers, by simple
  majority. If the vote is tied, the lead maintainer decides.
- **Disputes about checks** from users go through the
  [Dispute a check](https://github.com/dagwick/dagwick/issues/new?template=dispute.yml)
  form and are decided the same way.

### Non-negotiables

These rules protect everyone who installs Dagwick. Changing one needs the
agreement of all maintainers:

- no runtime dependencies;
- read-only: never write to the Airflow database, never run DAG code inside
  Airflow, never make network calls;
- every endpoint uses Airflow's own security checks;
- no secrets in settings;
- errors never expose internals.

## Roles

| Role | Who | Responsibilities |
| --- | --- | --- |
| **User** | Anyone who installs Dagwick | Report bugs, dispute checks, suggest ideas. |
| **Contributor** | Anyone who opens a pull request | Follow [CONTRIBUTING.md](CONTRIBUTING.md): tests, changelog entry, no new dependencies. |
| **Maintainer** | The people listed below | Review and merge pull requests, triage issues and disputes, keep CI and dependencies healthy, handle security reports within the times in [SECURITY.md](SECURITY.md), enforce the [Code of Conduct](CODE_OF_CONDUCT.md). |
| **Release manager** | Any maintainer | Cut releases following [RELEASING.md](RELEASING.md). Another maintainer must approve the PyPI upload in the `pypi` environment. |
| **Lead maintainer** | Ardalan Jalal | Breaks tied votes and sets the direction in [ROADMAP.md](ROADMAP.md) together with the other maintainers. |
| **Organization owner** | Ardalan Jalal, Sako Ranj | Manage the `dagwick` GitHub organization, repository settings and access. |

### Maintainers

| Name | GitHub | Focus |
| --- | --- | --- |
| Ardalan Jalal | [@ardalan-jalal](https://github.com/ardalan-jalal) | Lead maintainer, checks and scoring, releases |
| Sako Ranj | [@sako-ranj](https://github.com/sako-ranj) | Security, CI and release pipeline |
| Bawar Khalid | [@BawarX](https://github.com/BawarX) | UI and the mascot |

All maintainers are code owners in [`.github/CODEOWNERS`](.github/CODEOWNERS),
so each pull request requests their review.

### Becoming a maintainer

A contributor who has made several good contributions and reviews can be
invited by the existing maintainers (simple majority). Maintainers who stop
taking part can step down, or are moved to an *emeritus* list after a year
without activity.

## Continuity

The project must be able to keep going within a week if any one person is no
longer available. To make that possible:

- The **GitHub organization** has at least two owners, so access can be
  managed without any single person.
- **Releases** need no personal secrets. PyPI publishing uses Trusted
  Publishing from GitHub Actions, and the `pypi` environment can be approved by
  any of the maintainers.
- The **PyPI project** has at least two owners.
- The **OpenSSF Best Practices** entry can be edited by more than one
  maintainer.
- Dagwick has no domain name, servers or paid accounts to hand over.

If a maintainer becomes unavailable, the remaining maintainers carry on with
issues, reviews and releases, and update this page.

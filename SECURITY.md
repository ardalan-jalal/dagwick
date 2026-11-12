# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Report them
privately with GitHub's form:

**<https://github.com/dagwick/dagwick/security/advisories/new>**

(It is also on this repository's **Security** tab, under **Report a
vulnerability**.) Only the maintainers can see the report.

Please include the Dagwick and Airflow versions, what an attacker can do, and
the steps to reproduce it.

What happens next:

- We acknowledge the report within **3 working days** and keep you updated
  until it is fixed.
- We agree a disclosure date with you once a fix is ready.
- The fix is announced in a **GitHub Security Advisory**, with a CVE when one
  applies, and in the release notes. We credit you unless you prefer not.

Published advisories: <https://github.com/dagwick/dagwick/security/advisories>

## Supported versions

Only the latest released minor version receives security fixes.

## Security design

Dagwick runs inside the Airflow api-server. It is designed to add no new attack
surface beyond what Airflow already exposes:

- **Same permissions as Airflow.** Every endpoint uses Airflow's own security
  dependencies (`requires_access_dag`, `get_authorized_dag_ids`). A user only
  sees scores for DAGs they can already read in the Airflow UI.
- **Read-only.** Dagwick reads serialized DAGs from the metadata database. It
  never writes to the database, never executes DAG code, and never makes network
  calls.
- **No secrets.** Dagwick reads no Airflow Variables, Connections or
  credentials. Its settings in `airflow.cfg` are all optional and none of them
  is secret: `[dagwick] seasonal_moods` (cosmetic), `disabled_checks`,
  `weights` and `grades` (how DAGs are scored).
- **Safe errors.** Error responses contain only a generic message and a
  reference id. Details go to the server log, never to the browser.
- **Same origin only.** No CORS headers are added.
- **Static files from an allowlist.** The static route never builds file paths
  from user input.
- **No third-party code in the browser.** The UI bundle uses the React that
  Airflow already provides. It loads nothing from a CDN, uses no
  `innerHTML`, and stores nothing in `localStorage`.
- **No runtime dependencies.** The package declares no dependencies of its own.
- **Signed releases.** Releases are published from GitHub Actions with PyPI
  Trusted Publishing (no stored token), with a build provenance attestation
  and Sigstore signatures. See "Verify a release" in `RELEASING.md`.

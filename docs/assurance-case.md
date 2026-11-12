# Security assurance case

**Claim:** installing Dagwick in an Airflow 3 deployment adds no way for anyone
to see or change more than Airflow already allows them to.

This page backs that claim with a threat model, the trust boundaries, how
secure design principles are applied, and how common weaknesses are countered.
The architecture is described in [architecture.md](architecture.md); what users
can expect is summarised in [SECURITY.md](../SECURITY.md).

## Threat model

### What we protect

- **DAG data:** DAG structure, source code, run history and who owns what.
  Users must only see DAGs that Airflow lets them read.
- **Secrets inside DAG files:** the secrets check finds them, and must never
  show them.
- **The Airflow deployment itself:** its database, its configuration and the
  machines it runs on.
- **Users of the package:** what they install from PyPI must be what this
  repository built.

### Who might attack

| Actor | Can do | Wants to |
| --- | --- | --- |
| Anonymous network user | Reach the api-server over HTTP | Read any DAG data without logging in |
| Logged-in Airflow user with limited rights | Call Dagwick's endpoints | See DAGs, code or runs they are not allowed to see |
| Author of a DAG file | Put any text in a DAG file | Make Dagwick run code, leak data, or crash the api-server |
| Attacker in the supply chain | Tamper with a dependency, a build or a release | Ship malicious code to Dagwick users |

Out of scope: an Airflow administrator (who already controls everything), and
a compromised Airflow itself.

## Trust boundaries

1. **Browser → api-server.** All requests go through Airflow's authentication
   and authorization. Dagwick trusts nothing in the request except a DAG id,
   which it validates (length 1–250) and checks through Airflow.
2. **api-server → metadata database.** Dagwick only reads, using Airflow's
   models and SQLAlchemy queries with bound parameters.
3. **DAG source → Dagwick.** DAG source text is untrusted input. In the plugin
   it is only parsed as text (`tokenize`, regular expressions), never imported
   or executed.
4. **DAG files → `dagwick check` (CLI only).** The CLI imports DAG files, so
   their code runs, as in Airflow's own DAG processor. It is meant for a
   team's own DAGs in CI; this is stated in the command's help and the README.
5. **Check packs → Dagwick.** A check pack is a Python package the Airflow
   administrator chose to install, so it has the same trust as any other
   installed package. A failing pack check cannot break the other checks.
6. **This repository → PyPI → users.** Releases are built by GitHub Actions and
   published with Trusted Publishing; there is no stored token to steal.

## Secure design principles

| Principle | How Dagwick applies it |
| --- | --- |
| Least privilege | Dagwick asks Airflow for the same permissions core Airflow needs for the same data (DAG, DAG Code, Task Instances, DAG Runs, DAG Versions). It has no permissions of its own. |
| Complete mediation | Every data endpoint has Airflow's security dependency; the fleet page narrows to `get_authorized_dag_ids` before reading anything. Tested in `tests/test_permissions.py`. |
| Fail-safe defaults | Unknown static file or theme → 404. A check that raises is reported as skipped, not passed. Errors return a generic message. |
| Economy of mechanism | No runtime dependencies, no storage, no background jobs, no outgoing network. |
| Open design | All code, checks and weights are public; nothing relies on secrecy. |
| Separation of privilege | A release needs an approval from a second maintainer in the `pypi` environment. Pull requests need a review from someone other than the author. |
| Least common mechanism | Dagwick adds no shared state between users; the only browser storage is one per-viewer, non-sensitive switch (whether seasonal moods are hidden). |
| Psychological acceptability | Dagwick works with Airflow's own roles; admins do not configure separate access rules. |

## Common weaknesses and how they are countered

| Weakness (OWASP / CWE) | Countermeasure | Evidence |
| --- | --- | --- |
| Broken access control (CWE-284, CWE-639) | Airflow security dependencies on every endpoint; fleet narrowed to authorized DAG ids | `api.py`, `tests/test_permissions.py` |
| Injection: SQL (CWE-89) | SQLAlchemy `select()` with bound parameters, no string-built SQL | `health.py`, `history.py` |
| Code injection from DAG files (CWE-94) | DAG source is tokenized or matched as text, never imported in the plugin | `acknowledge.py`, `checks/_source.py` |
| Path traversal (CWE-22) | Static files from a fixed allowlist; paths never built from the request | `api.py` `STATIC_FILES` |
| Cross-site scripting (CWE-79) | React escapes all output; no `innerHTML` or `dangerouslySetInnerHTML`; no third-party scripts or CDNs | `ui/src/` |
| Information exposure in errors (CWE-209) | Generic message plus a reference id; details only in the server log | `api.py` `_server_error` |
| Leaking secrets found in DAGs (CWE-200) | The secrets check reports where a secret is, never its value | `checks/_secrets.py`, `tests/test_secrets.py` |
| Cross-origin requests (CWE-942) | No CORS headers; the UI fetches same-origin only | `api.py`, `ui/src/api.ts` |
| Denial of service from crafted input (CWE-400) | DAG id length limits; fuzzing of the DAG-source parser and settings parser | `fuzz/`, `.github/workflows/fuzz.yml` |
| Vulnerable or malicious dependencies (CWE-1104, CWE-1357) | No runtime dependencies; Dependabot, OSV and Scorecard on development dependencies; pinned GitHub Actions | `.github/dependabot.yml`, `.github/workflows/` |
| Tampered releases (CWE-494) | Trusted Publishing, build provenance attestations and Sigstore signatures | [RELEASING.md](../RELEASING.md#verify-a-release) |

## How this stays true

- CI runs tests (including permission tests), CodeQL and fuzzing on every pull
  request.
- Reviewers check the non-negotiables in [GOVERNANCE.md](../GOVERNANCE.md#non-negotiables)
  on every pull request.
- Vulnerabilities are handled as described in [SECURITY.md](../SECURITY.md).
- This page is reviewed when a new endpoint, input or dependency is added.

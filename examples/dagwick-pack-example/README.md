# Example Dagwick check pack

A check pack adds your own rules to [Dagwick](https://github.com/dagwick/dagwick)
without changing Dagwick. This one has a single check, **Has a team tag**.
It is an example and is not published: copy this folder to start your own pack.

```text
pyproject.toml                    the dagwick.checks entry point
src/dagwick_pack_example/checks.py    the check
tests/test_checks.py              tests against a serialized DAG
```

Install it next to Dagwick in your Airflow environment and restart the
api-server:

```bash
pip install ./examples/dagwick-pack-example
```

The check then shows up on every DAG, tagged with the pack's name.

Run its tests from this folder in an environment that has Airflow and Dagwick:

```bash
pytest
```

The guide is in [docs/checks.md](../../docs/checks.md#write-a-check-pack).

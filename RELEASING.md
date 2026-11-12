# Releasing

Publishing a **GitHub Release** uploads Dagwick to PyPI automatically
(`.github/workflows/release.yml`). PyPI trusts that workflow through
**Trusted Publishing**, so no PyPI token is stored anywhere.

Versions follow [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`.
A PyPI version can never be uploaded twice, so each release needs a new number.

## One-time setup

Already done for this repository. Only needed again if the repo or workflow
moves.

1. On <https://pypi.org/manage/account/publishing/>, add a GitHub trusted
   publisher (a *pending* one if the project does not exist yet):

   | Field | Value |
   | --- | --- |
   | PyPI Project Name | `dagwick` |
   | Owner | `ardalan-jalal` |
   | Repository name | `dagwick` |
   | Workflow name | `release.yml` |
   | Environment name | *(leave empty)* |

2. Publishers cannot be edited. If a field is wrong, remove it and add it again.

## Release steps

Example for `0.2.0`. Run everything from the repository root on an up-to-date
`main`.

**1. Set the version** in `src/dagwick/__init__.py`:

```python
__version__ = "0.2.0"
```

**2. Rebuild the UI.** The footer shows the version, and CI fails if the
committed bundle is out of date:

```bash
npm ci --prefix ui && npm run build --prefix ui
```

**3. Write and date the changelog.** In `CHANGELOG.md`, describe what changed
under `### Added`, `### Changed`, `### Fixed` or `### Removed`, written for
users. Then change `## [0.2.0] - unreleased` to today's date, for example
`## [0.2.0] - 2026-11-20`. This section becomes the GitHub release notes.

**4. Check everything:**

```bash
uvx ruff check && uvx ruff format --check
uv run --locked pytest
npm test --prefix ui
uv build && uvx twine check --strict dist/* && rm -rf dist
```

**5. Commit and push** to `main`:

```bash
git commit -am "Release Dagwick 0.2.0"
git push origin main
```

Wait for CI to pass on that commit.

**6. Tag and publish the release.** The release notes come from the version's
section in `CHANGELOG.md`, followed by GitHub's list of merged changes:

```bash
git tag v0.2.0
git push origin v0.2.0
python3 scripts/release_notes.py 0.2.0 > /tmp/dagwick-notes.md
gh release create v0.2.0 --title "Dagwick 0.2.0" \
  --notes-file /tmp/dagwick-notes.md --generate-notes --verify-tag
```

The tag must be `v` + the version in `__init__.py`, and the changelog section
must be dated. The workflow stops if either is wrong.

**7. Verify:**

- The **Release** workflow passed: `gh run list -w Release -L 1`.
- The new version is on <https://pypi.org/project/dagwick/>.
- It installs cleanly next to Airflow and adds only one package:

  ```bash
  pip install "dagwick==0.2.0"
  ```
- The GitHub release lists the wheel, the sdist, a `.sigstore.json` bundle for
  each and the build provenance (`dagwick-<version>.intoto.jsonl`), and the
  files pass the checks in
  [Verify a release](#verify-a-release).

## Verify a release

The release workflow signs what it builds in two ways (from 0.3.0):

- A **build provenance attestation** for the wheel and sdist, stored by GitHub.
  It works for the files on PyPI too, because they are the same files:

  ```bash
  pip download dagwick==0.3.0 --no-deps -d dagwick-download
  gh attestation verify dagwick-download/*.whl -R ardalan-jalal/dagwick
  ```

  From the release after 0.3.0, the same provenance is also attached to the
  GitHub release as `dagwick-<version>.intoto.jsonl`, so it can be checked
  offline:

  ```bash
  gh attestation verify dagwick-release/*.whl -R ardalan-jalal/dagwick \
    --bundle dagwick-release/dagwick-*.intoto.jsonl
  ```

- **Sigstore bundles** (`*.sigstore.json`) attached to the GitHub release, next
  to the wheel and sdist:

  ```bash
  gh release download v0.3.0 -R ardalan-jalal/dagwick -D dagwick-release
  uvx sigstore verify identity \
    --cert-identity "https://github.com/ardalan-jalal/dagwick/.github/workflows/release.yml@refs/tags/v0.3.0" \
    --cert-oidc-issuer https://token.actions.githubusercontent.com \
    dagwick-release/*.whl dagwick-release/*.tar.gz
  ```

PyPI also shows its own attestations for each file (made by the publish step),
on the file's page under **Provenance**.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `invalid-publisher` | The PyPI trusted publisher does not match. Compare it with the table above (the environment must be empty), remove it and add it again, then re-run the failed job. |
| `Tag vX does not match version Y` | The tag and `__version__` differ. Delete the release and tag, fix the version, and tag again. |
| CI fails on "UI bundle matches its source" | You changed `ui/src/` or the version without rebuilding. Run step 2 and commit the bundle. |
| `CHANGELOG.md section X is not dated yet` | Date the section (step 3), commit, and move the tag (see below). |
| `Unknown classifiers` | PyPI does not accept a classifier in `pyproject.toml`. Fix it before tagging. |
| The upload failed after the build | Fix the cause and click **Re-run failed jobs**. Files already on PyPI are skipped. |
| `release-assets` failed | The package is already on PyPI. Click **Re-run failed jobs**; existing release files are replaced. |

## Moving a tag

Only move a tag (delete the release and tag, then tag again) **before** the
version reaches PyPI. Once it is on PyPI, release a new patch version instead.

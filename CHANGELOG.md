# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Dispute a check.** A failing or warning built-in check in the Dagwick tab
  now links to a "Dispute a check" GitHub issue form, pre-filled with the
  check id only (never the DAG id, file or code; the link sends no referrer).
  `dagwick check` prints the same link to stderr when a check is flagged; JSON
  output is unchanged. Checks from check packs get no link.

### Changed

- **The repository moved to the `dagwick` organization:**
  <https://github.com/dagwick/dagwick>. Old links redirect. Releases up to
  0.3.x still verify against `ardalan-jalal/dagwick`, where they were signed.

- **Dagwick checks the same DAG permissions as Airflow.** Each endpoint now
  also requires the DAG sub-permissions core Airflow asks for before showing
  the same data:
  - the score needs DAG Code and Task Instances;
  - score history needs DAG Code and DAG Versions;
  - run health needs DAG Runs and Task Instances;
  - the fleet page needs all three.

  Before, plain DAG read was enough, so under the FAB auth manager a role
  without "DAG Code" could still see a DAG's ack comments and where its
  secrets are. Check custom roles; the default SimpleAuthManager doesn't
  separate these permissions, so nothing changes there. Found by
  a source audit with Cloudflare's security-audit skill.
- **Releases carry their build provenance as a file.** Next to the wheel, the
  sdist and their Sigstore bundles, the GitHub release now includes
  `dagwick-<version>.intoto.jsonl`, the same signed provenance GitHub stores
  for `gh attestation verify`. OpenSSF Scorecard's Signed-Releases check looks
  for it there.

### Fixed

- **Small hardening from a source security audit** (Cloudflare's
  security-audit skill):
  - **Ack reasons** are shown to everyone who can see a DAG's grade, so a
    credential pasted into a `# dagwick: ack` comment is now hidden, and
    reasons are capped at 200 characters.
  - **Secret findings** no longer repeat a dict key that isn't a plain name,
    since such a key could itself contain a credential.
  - **The theme middleware** now changes only Airflow's own `/ui/config`
    route (also under `[api] base_url`), not any path that ends the same way.
  - **`dev/run.sh`** binds the sandbox to `127.0.0.1`. Every visitor is an
    admin there, so it must not be reachable from the network.
  - **`scripts/fleet_review.py`** no longer resends the token when the server
    redirects, and refuses to send it over plain `http://` except to this
    machine.
- **Fixes for the rest of that audit:**
  - **Secret scan:** the connection-URI pattern took quadratic time on long
    strings like `a.a.a.…`, so a DAG file could stall the api-server while it
    scored. The pattern now has a fixed start and length caps. It also finds
    URIs whose scheme follows an underscore, such as `my_postgresql://`.
  - **The fleet page** now builds each DAG's cache key from its hash, read
    without its data, and loads and deserializes a DAG only when its score is
    not cached. Before, every request loaded up to 2,000 DAGs even with a
    warm cache.
  - **Check packs** load under a lock. A request that arrived while packs were
    importing could score with only part of the checks and cache that score.
  - **Releases** run in a protected `pypi` GitHub environment and refuse a tag
    whose commit is not on `main`. **Maintainers:** before the next release,
    create the environment and re-add the PyPI trusted publisher with
    environment `pypi` (see `RELEASING.md`), or the upload fails with
    `invalid-publisher`.

## [0.3.0] - 2026-11-10

### Added

- **Seasonal themes for all of Airflow** (`themes/`, config only): realistic
  snow, Halloween, Newroz and Kurdish Language Day as plain `[api] theme`
  files for Airflow 3.2+. The scenery is drawn behind the page, stops under
  reduced motion and loads nothing from the network. No plugin code.
- **Seasonal themes for all of Airflow, built in.** A new Themes tab next to
  Fleet lists them. By default each theme appears on its dates on every Airflow
  page and goes away afterwards, with nothing to set in Airflow's
  configuration. The first theme is Christmas snow (18 December to 2 January):
  snowflakes drift over Airflow, some carried sideways by the wind, snow
  settles on top of cards, and a drift lies along the bottom. The snow is moved
  by the graphics card, so pages stay smooth; clicks go through it, and viewers
  who prefer reduced motion get still snow. Each viewer can switch off "Show
  themes on their dates", and apply or remove any theme whenever they like; the
  change shows at once, without a reload. Choices are saved in their browser,
  and Dagwick still writes nothing to Airflow's database. Any theme the admin
  already set in Airflow is kept.
- **Halloween theme** (24 October to 1 November): dark bats flit about on
  their own random paths, beating their wings, ghosts drift across Airflow,
  embers rise, a full moon with seas, craters and thin clouds peeks from the
  corner, darkness closes in from the edges, glowing eyes blink in the fog along
  the bottom, a small cobweb hangs in the corner, black gnarled branches lie on
  top of the cards (like the snow at Christmas), and spiders dangle from them.
  Airflow's sidebar, with the user menu, always stays clear of the decorations.
  Switching between themes without a reload clears the old theme first.
- **The banner follows the theme.** When a seasonal theme is showing, by date
  or applied by the viewer, Dagwick's banner takes the matching seasonal look
  (Wick in a Santa hat with snow at Christmas, a witch hat and pumpkin at
  Halloween), whatever the `seasonal_moods` setting says.
- **Themes coming soon.** Newroz, Eid, Ramadan, Kurdish Language Day, New
  Year, Dagwick's birthday, Çarşema Sor, Diwali and the Lantern Festival are
  listed on the Themes page as "Coming soon", after Christmas and Halloween.
  They can't be applied until their decorations for all of Airflow are made;
  on their dates Dagwick's banner still dresses up (the seasonal mood), unless
  the viewer turned off "Show themes on their dates": that switch now turns off
  the banner's date-based look too. Eid
  and Ramadan follow the Islamic calendar, from a table of approximate dates
  for 2026-2031.
- **Sidebar icon in Airflow's style:** a candle outline in the same line style
  and colours as Airflow's own sidebar icons, with a version for dark mode, and
  white while Dagwick's page is open, like Airflow's highlighted items.
- **Download the fleet as CSV.** A button on the fleet page saves the DAGs
  shown (with the current search and filters) as a CSV file: dag_id, owners,
  tags, paused, score, grade, failing and warning checks, runs and success
  rate over 30 days. It is built in the browser from `/api/fleet`, so it holds
  only the DAGs the user may read. Cells that a spreadsheet would run as a
  formula are written as text.
- `/api/fleet` includes each DAG's `tags`.
- **Fleet data in a dashboard** (`docs/dashboards.md`): how to read
  `/dagwick/api/fleet` with an Airflow API token and feed it to Grafana, a
  warehouse or alerts. Dagwick does not add a metrics endpoint or push
  metrics: scrapers can't easily authenticate against Airflow 3, and the
  plugin makes no network calls.
- **Tune the scoring in `airflow.cfg`.** Three optional `[dagwick]` settings:
  `disabled_checks` leaves checks out of every score, `weights` changes how
  many points a check is worth, and `grades` sets the grade thresholds.
  Invalid values are logged and ignored. The DAG tab, the fleet page and
  `dagwick check` all follow them. See `docs/checks.md`.
- `/api/checks` shows each check's `default_weight` and whether it is
  `enabled`; `/api/config` includes the grade thresholds.
- **Check packs.** A guide, "Write a check pack", in `docs/checks.md`, and an
  example pack in `examples/dagwick-pack-example` with one check and its
  tests. The guide says which parts of the check interface are stable.
- Each check now records which pack it came from: `pack` in `/api/checks` and
  in score reports, and a tag on pack checks in the DAG tab.
- **Signed releases.** Each release now has a build provenance attestation,
  and its GitHub release carries the wheel, the sdist and their Sigstore
  bundles. See "Verify a release" in the README.

### Changed

- **New mascot and icon.** Dagwick's mascot is now Wick, a little flame on a
  candle stamped with a DAG: one more node lights up with every grade, and at F
  the flame is out and only smoke is left. The seasonal moods dress Wick up
  (a bonfire at Newroz, a pumpkin at Halloween, a fanous at Ramadan, a cupcake
  on its birthday, ...). The sidebar icon and the README banner match.
- `SECURITY.md` links the private reporting form and published advisories,
  and lists every `[dagwick]` setting.
- **Seasonal moods are on by default** (#35). `seasonal_moods` now defaults to
  `auto`, so Wick dresses up on each holiday's dates with nothing to configure.
  To keep the old behaviour, set `seasonal_moods = off`. Each viewer can still
  hide them with **Hide** on the greeting.
- **Three new moods** (#35): **Çarşema Sor**, the Yazidi New Year (red spring
  flowers, painted eggs, a flower crown for Wick), **Diwali** (Wick in a clay
  diya, marigold garlands, a row of lit diyas) and the **Lantern Festival**
  (a red-and-gold candle, red lanterns swinging, sky lanterns drifting up).
  Diwali and the Lantern Festival follow lunisolar calendars, so their dates
  are listed per year for 2026–2031. Each also appears on the Themes page
  as "Coming soon". A short festival wins over a longer one it falls in:
  Dagwick's birthday over Diwali 2026, Diwali over Halloween 2027, the Lantern
  Festival over Ramadan 2026.
- **Smoother mood scenes.** Falling snow and confetti, flying bats, rising
  balloons, embers and letters now move with GPU transforms instead of
  changing their position, so the page isn't laid out again on every frame.

### Fixed

- Newroz's embers in the banner never rose: Wick's own ember style overrode
  them. They now drift up again.
- A DAG file with a bare carriage return (`\r`) before a non-ASCII character
  could not be scored on Python 3.12: reading its `# dagwick: ack` comments
  crashed. Such a file is now scored as if it had no ack comments. Found by
  the new fuzz tests.
- **Phones and a narrow DAG panel.** Below about 440 px the header no longer
  clips the score ring and Wick's speech bubble: both shrink to fit side by
  side. On the fleet page the search box now spans the row below 720 px, as
  intended, instead of staying 260 px wide and pushing the DAG list past the
  edge. Found in the 0.2.0 QA (#34).
- `/dagwick/api/health` and `/dagwick/api/history` now return 404 for a DAG
  that does not exist, like `/dagwick/api/score`, instead of an empty 200. A
  typo in a script or dashboard now fails loudly (#60).
- The README now explains that Viewer and User roles need `can read on
  Plugins` (FAB) to see Dagwick's pages, and how to give it (#58).
- **Text contrast now meets WCAG AA (4.5:1).** The A–D grade badges use darker
  shades so their white letter is readable at small sizes, and small amber text
  in the light theme ("Dagwick", "Next step", "How to fix") uses a darker amber.
  Tab counts and "passed" chips are darker too. Bars and the score ring keep
  their colours (#59).
- **Themes apply without a hard refresh.** Airflow's `/ui/config` reply now
  says `Cache-Control: no-store` and `Vary: Cookie`, because it depends on the
  viewer's theme cookies: a browser or proxy can no longer keep showing the
  theme from before an Apply or Remove.
- **Halloween now decorates Airflow's sidebar too:** a dusk glow behind the
  icons, a cobweb in the corner by the logo and a spider letting itself down
  along the edge. Nothing covers the icons or the user menu, and clicks pass
  through.

## [0.2.0] - 2026-11-09

### Added

- **Seasonal moods (experimental, off by default).** During holidays the mascot dresses up and the page
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
- **Acknowledge a check on purpose.** A `# dagwick: ack <check> -- <reason>`
  comment in the DAG file marks a check the DAG breaks on purpose. It shows
  greyed out with the reason, is left out of the score and of "Most common
  issues", and is counted on the fleet page. Only 8 checks allow it
  (see `docs/checks.md`); a reason is required.
- New status `ack` in the API; check results gain `ack_reason` and `ack_note`.
  `@check` gains `acknowledgeable` and `ack_hint`.
- **No `Variable.get` at parse time** also checks the body of `@dag`
  functions, which runs on every parse; `@task` functions inside stay deferred.
- New check, **No secrets in the DAG file**, in a new **Security** category:
  flags string values assigned to secret-looking names (`password`, `token`,
  `api_key`, `client_secret`, ...), known credential formats (AWS key ids,
  private keys, GitHub and Slack tokens, Slack webhooks, Google API keys) and
  passwords inside connection URIs. Only the line and the kind are shown,
  never the value. It cannot be acknowledged.
- New check, **Sensors free their worker slot**: warns when a sensor that
  runs in poke mode typically waits a minute or more per run, holding a
  worker slot the whole time. Which tasks are sensors comes from the
  serialized DAG, how each one waits from the DAG source (`mode`,
  `deferrable`, `*Async` classes, `default_args`, `@task.sensor`), and how
  long it waits from the last 30 days of runs. Rescheduled sensors are proven
  by their `task_reschedule` rows. When the evidence is unclear the check
  skips instead of guessing. It can be acknowledged with a reason.
- `Context` gains `sensor_tasks`, `sensor_runs` and `default_deferrable`.
- **Run health** on the DAG tab, next to the score but not part of it: share
  of runs that succeeded, share of tasks that needed a retry, the typical
  run time with its trend (last 7 days against the rest of the window) and
  the last run, all over the last 30 days. The fleet page shows each DAG's
  success rate. Read from the runs Airflow already records; nothing is stored.
- New endpoint `GET /dagwick/api/health?dag_id=...`, behind the same DAG
  permission as `/api/score`.
- **Score history** on the DAG tab: the score of each of the last 20 DAG
  versions, re-scored from the serialized DAG and source code Airflow keeps
  for every version, with which checks started or stopped passing at each
  step. Nothing is stored by Dagwick; each version's score is cached in
  memory until that version's DAG or source changes (Airflow updates the
  newest version in place until the DAG runs again). Only code checks
  count (parse time and other run-time facts describe the present, not past
  versions).
- New endpoint `GET /dagwick/api/history?dag_id=...`, behind the same DAG
  permission as `/api/score`.
- **`dagwick check` command** and a **pre-commit hook**: grade DAG files
  before they are merged, with the same checks as the UI (acknowledgements,
  source checks and parse time included), and exit with status 1 below
  `--min-grade`, or 2 when a file fails to load. `--json` prints the reports.
  It imports the DAG files, so it is meant for developer machines and CI; the
  plugin itself still never runs DAG code.

### Fixed

- Fleet headline no longer contradicts the stats: it describes the average
  grade and then states how many DAGs need care.
- "need care" now counts grades C to F, so it and "healthy (A–B)" add up to
  the number of DAGs.
- Layout follows the width Dagwick actually has (container queries), so the
  DAG tab inside Airflow's split panel gets the narrow layout.
- Narrow screens: grade labels are no longer cut off, the lamp and score ring
  sit side by side, and the fleet's "Most common issues" moves below the list.
- Category cards no longer leave one card alone on the last row.
- Every failing check opens with its fix by default.
- On screens wider than 1440 px the page is centered instead of sticking to
  the left with empty space on the right.

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

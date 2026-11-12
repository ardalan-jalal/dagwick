# Seasonal moods

During holidays Wick, the Dagwick flame, dresses up and the page header gets a
small animated scene. Moods are **decoration only**: scores, grades and text never
change, and everything goes back to normal when the holiday ends.

Moods dress up Dagwick's own pages. To decorate all of Airflow for a holiday,
see the [config-only themes](https://github.com/dagwick/dagwick/blob/main/themes/README.md).

![All seasonal moods](https://raw.githubusercontent.com/dagwick/dagwick/main/docs/screenshots/moods.png)

| Mood | When | What you see |
| --- | --- | --- |
| 🔥 Newroz | Mar 19 – 23 | Wick becomes a bonfire and wears a flower crown; bonfires on the mountains, govend dancers |
| 🍪 Eid | Eid al-Fitr (3 days) and Eid al-Adha (4 days) | An emerald candle with a gold band, a plate of kulîçe, a crescent, bunting |
| ✍️ Kurdish Language Day | May 15 | Reading glasses, a candle on a stack of books, a quill and inkwell, Kurdish letters floating up |
| 🎄 Christmas | Dec 18 – 26 | Santa hat, a candy-striped candle in a pine wreath, falling snow, a snow bank |
| 🎉 New Year | Dec 31 – Jan 2 | Party hat, a midnight-blue candle with gold stars, fireworks, confetti |
| 🎃 Halloween | Oct 24 – Nov 1 | Green flame, witch hat, a jack-o'-lantern with a spider, bats flying under a full moon |
| 🌙 Ramadan | the month of Ramadan | Wick inside a fanous, crescent moon, stars, hanging lanterns |
| 🎂 Dagwick's birthday | Nov 8 | Party hat, a candle on a cupcake, balloons, confetti |
| 🥚 Çarşema Sor (Yazidi New Year) | the first Wednesday from Apr 14 | A crown of red flowers, a white candle among painted eggs, red flowers in a meadow, the sunrise |
| 🪔 Diwali | five days around Lakshmi Puja | Wick in a clay diya with marigolds, a marigold garland, a row of lit diyas |
| 🏮 Lantern Festival | the 15th day of the first Chinese month | A red-and-gold candle with a small lantern, red lanterns swinging, sky lanterns drifting up |

Each mood also shows a short English greeting (for example "Happy Newroz!").

- **Dates** use the viewer's local calendar. Ramadan and Eid follow the
  Umm al-Qura Islamic calendar built into the browser, so they move every year
  without any date tables. Diwali and the Lantern Festival follow lunisolar
  calendars the browser doesn't have, so their dates are listed for 2026–2031
  (in `ui/src/season.ts` and `src/dagwick/themes.py`); extend both tables as
  the years go by. Çarşema Sor is the first Wednesday of April on the Julian
  calendar, which is worked out for any year. Locally observed dates can differ
  by a day.
- **Overlaps:** when two moods fall on the same day, a short festival wins
  over a longer one: Newroz over Eid al-Fitr 2026, Dagwick's birthday over
  Diwali 2026, Diwali over Halloween 2027, and the Lantern Festival over
  Ramadan 2026. The full order is `SEASON_ORDER` in `ui/src/season.ts`.
- **Viewers** can click **Hide** on the greeting to turn moods off for
  themselves (remembered in their browser), and **Show** to bring them back.
- **Motion:** all animation stops for viewers who prefer reduced motion.

## Settings (optional)

Moods are **on by default**. An admin can turn them off, or keep only some,
in `airflow.cfg`:

```ini
[dagwick]
seasonal_moods = auto              # every mood (default)
# seasonal_moods = off             # no moods
# seasonal_moods = newroz,eid,christmas   # only these
```

or with the environment variable `AIRFLOW__DAGWICK__SEASONAL_MOODS`. Mood ids:
`newroz`, `eid`, `language-day`, `carsema-sor`, `lantern-festival`,
`christmas`, `new-year`, `birthday`, `diwali`, `halloween`, `ramadan`.

## Preview a mood

Add `?dagwick_mood=<id>` to a Dagwick page URL, for example
`.../plugin/dagwick?dagwick_mood=newroz`. Use `?dagwick_mood=everyday` to see
the everyday candle.

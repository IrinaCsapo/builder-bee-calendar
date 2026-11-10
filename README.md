# BuilderBee

A global calendar of hackathons and tech events for women and non-binary builders: hackathons, buildathons, meetups, conferences, workshops, bootcamps and pitch nights, online and in person.

**Live site:** https://irinacsapo.github.io/builder-bee-calendar/

Built live on the show in about three hours, after we met at the Lovable SheBuilds hackathon.

## Run it locally

You need [Node.js](https://nodejs.org) 22 or newer (the same version the deploy uses).

```bash
npm install
npm run dev
```

Then open http://localhost:5173/builder-bee-calendar/

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with live reload |
| `npm run validate` | Checks `src/data/events.json` for mistakes |
| `npm run build` | Validates the events, type-checks, and builds the site into `dist/` |
| `npm run preview` | Serves the built site locally |
| `npm run import-csv -- file.csv` | Converts a CSV of events into `events.json` (see below) |

## Add an event

### From a submission

Events are added automatically every morning at 7:00 (London) by the event scout (a scheduled Claude
routine that follows [`docs/event-scout.md`](docs/event-scout.md) and pushes straight to `main`).
You can still add events by hand:

1. Someone fills in the [submission form](https://github.com/IrinaCsapo/builder-bee-calendar/issues/new?template=submit-event.yml). It creates a GitHub issue labelled `event-submission`.
2. Check the event is real, upcoming, and open to women and non-binary builders.
3. Add it to [`src/data/events.json`](src/data/events.json). Copy an existing event and change the values. The form's fields have the same names as the JSON.
4. Run `npm run validate`, commit and push. The site updates in a minute or two.
5. Comment on the issue with the event link (`.../#/event/<id>`) and close it.

### Event fields

| Field | Required | Example / allowed values |
|---|---|---|
| `id` | yes | Lowercase slug, unique: `femmehacks-2027` |
| `title`, `organiser` | yes | Free text |
| `event_type` | yes | Hackathon, Buildathon, Meetup, Conference, Workshop, Bootcamp, Pitch night |
| `format` | yes | In person, Online, Hybrid |
| `start_date`, `end_date` | yes | `2027-03-27` (same date twice for one-day events) |
| `timezone` | yes | IANA name: `Europe/London`, `America/New_York` |
| `city`, `country` | yes | `""` (empty) for online events |
| `region` | yes | Europe, North America, LatAm, Africa, Asia, Oceania, Global |
| `venue` | no | |
| `lat`, `lng` | in person / hybrid | City-centre coordinates, e.g. `53.4808`, `-2.2426`. Used for "Nearest first" |
| `themes` | yes | List from: AI, Fintech, Health, Climate, Web3, Design, No-code, Hardware, Social impact, Marketing, Creative. Can be `[]` |
| `audience` | yes | Shown exactly as the organiser writes it |
| `level` | yes | Beginner friendly, All levels, Advanced |
| `cost` | yes | Free, Paid |
| `registration_url` | yes | Full `https://` link |
| `deadline` | no | `2027-03-01` |
| `image_url` | no | The official page's preview image, loaded from the organiser's host (not copied into the repo). Events without one get a branded placeholder |
| `source` | yes | Where it came from, or `placeholder` |

The allowed values live in [`src/types/event.ts`](src/types/event.ts). To add a new theme or type, add it there and to the issue form in [`.github/ISSUE_TEMPLATE/submit-event.yml`](.github/ISSUE_TEMPLATE/submit-event.yml).

**Typos fail the build.** `npm run build` runs [`scripts/validate-events.ts`](scripts/validate-events.ts) first. A misspelled type, an invalid date or timezone, a duplicate id or an unknown field stops the build with a message saying which event and which field. A broken event never reaches the live site.

**Nearest first.** The list starts sorted by distance from a rough guess based on the visitor's timezone (no prompt). "Use my exact location" asks the browser for permission. The location is only used in the visitor's browser: never sent anywhere, stored, or put in the URL.

Events disappear from the list automatically the day after their `end_date`. Their pages stay reachable, with an "ended" notice, so shared links keep working.

### From a spreadsheet (CSV)

Export the sheet as CSV with column headers matching the field names. [`scripts/events-template.csv`](scripts/events-template.csv) has the full header row and one example.

```bash
npm run import-csv -- ~/Downloads/events.csv           # replace all events
npm run import-csv -- ~/Downloads/events.csv --merge   # add/update by id, keep the rest
```

- Headers are forgiving: `Start Date`, `start_date` and `Organizer` all work.
- `themes`: separate with `;` or `|`, e.g. `AI; Climate`.
- Empty `id` is generated from the title and year. Empty `end_date` means a one-day event. Online events with no region get `Global`. Empty `source` becomes `CSV import`.
- If any row is invalid, the script lists the problems and leaves `events.json` unchanged.

## How deploys work

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on GitHub Actions:

1. Installs dependencies (`npm ci`)
2. Runs `npm run build`, which validates events, type-checks, and builds
3. Publishes `dist/` to GitHub Pages

Watch it under the repo's **Actions** tab. A red cross usually means an event failed validation: open the run and the message tells you which one.

One-time setup on GitHub: **Settings → Pages → Source: GitHub Actions**, and an `event-submission` label under **Issues → Labels**.

The site uses hash URLs (`#/event/femmehacks-2027`, `#/?format=Online`) so every page and filtered view works on GitHub Pages with no server setup. If you rename the repo, update `base` in [`vite.config.ts`](vite.config.ts) and the links in [`src/lib/site.ts`](src/lib/site.ts).

## Project structure

```
src/
  data/events.json        the events
  types/event.ts          the event type and allowed values
  lib/                    dates, filters, routing, site links
  styles/tokens.css       design tokens: colours, font, spacing
  components/             EventCard, FilterBar, MonthHeader, Badge, Chip, EmptyState, ...
  pages/                  Home, Event, Submit, About, Not found
scripts/                  validate-events.ts, csv-to-json.ts
.github/                  deploy workflow, submission issue form
```

Each component is a folder with `Name.tsx` and `Name.css`. Styling is plain CSS using the custom properties in `tokens.css`. No UI library.

**Dependencies:** `react` and `react-dom` at runtime. For development: `vite` and `@vitejs/plugin-react` (dev server and build), `typescript` and `@types/*` (type checking), `tsx` (runs the TypeScript scripts).

## Credits

The ASCII bees and butterflies code ([`src/ascii/`](src/ascii/), not on the page at the moment) uses the cell-sampling technique from ascii-sharks by drewdi (MIT licence), rewritten for bees and butterflies.

## Accessibility

Built with WCAG 2.2 AA in mind, and checked page by page:

- Every filter is a real `<button>` or `<select>` with a label, works by keyboard, and has a visible focus ring
- Nothing relies on colour alone: pressed filters show a ✓, chips and badges are text
- All text is black (Newsreader for headlines, DM Sans for everything else). Black on the hero gradient is at least 4.96:1 for the headline and 9.2:1 for the description (measured on the image). Orange `#FF6A00` only ever has black text (7.31:1); purple `#7000F0` has white text (7.13:1); mint `#A3FFB8` has black text (17.55:1)
- Form field edges are `#8A8A8A` (3.45:1), meeting the 3:1 rule for controls
- Dates are written in full for screen readers ("27 February 2027 to 28 February 2027")
- The result count is a live region, so filter changes are announced
- Tap targets are at least 44×44px
- Landmarks, one `h1` per page, no skipped heading levels, skip link, focus moves to the new page's heading
- Respects `prefers-reduced-motion`
- Event cards: time-left badges are text ("Starts in 8d 2h"), urgency also shown by a heavier border; placeholder images and their title overlay are decorative because the real title is right below
- The featured carousel has a Pause button, pauses on hover and keyboard focus, never auto-rotates with reduced motion, and only announces slides the visitor changes

If you change colours in `tokens.css`, re-check contrast. The ratios are noted in the file.

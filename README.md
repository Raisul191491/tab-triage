<p align="center">
  <img src="public/icons/icon128.png" width="96" height="96" alt="Tab Triage icon" />
</p>

<h1 align="center">Tab Triage</h1>

A Manifest V3 Chrome/Edge extension that clusters your open tabs by topic,
scores each one for staleness, and lets you triage a tab hoard in a few
clicks instead of scrolling a 200-tab strip.

Built with Vue 3, Tailwind CSS, Vite, and [`@crxjs/vite-plugin`](https://crxjs.dev/vite-plugin).

## Why

Existing tab managers dump everything into one flat list. Tab Triage answers
the actual question a hoarder has: **which of these tabs can I close right
now without losing anything?**

- **Clusters** tabs by registrable domain — every GitHub tab lands in one
  "github.com" card, every Google Docs/Mail tab in one "google.com" card.
- **Scores staleness** per tab (idle time, never-activated penalty) and per
  cluster — pinned and audio-playing tabs are never flagged.
- **Flags duplicates** — the exact same page open multiple times — as their
  own always-visible group.
- **Undo-able** — every close action can be reversed within 8 seconds.
- **Save as reading list** instead of closing outright, when you're not
  ready to lose a cluster.
- **Zero data collection, zero host permissions** — see
  [PRIVACY.md](PRIVACY.md). Only `chrome.tabs` metadata is ever read; no
  page content, no content scripts, nothing leaves your browser.

## Install (development)

```sh
npm install
npm run build
```

Then in Chrome/Edge:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

For development with HMR: `npm run dev` (keep the unpacked extension pointed
at `dist/`).

## Architecture

- `src/lib/cluster.ts` — pure clustering function: groups tabs by
  registrable domain. No `chrome.*` calls, fully unit-tested.
- `src/lib/staleness.ts` — pure staleness scoring. Pinned/audible tabs are
  hard-excluded, not just down-weighted.
- `src/lib/duplicates.ts` — URL-normalization based duplicate detection.
- `src/lib/activity-log.ts` — persists tab activation history to
  `chrome.storage.local` so staleness scoring survives MV3 service-worker
  restarts.
- `src/background/service-worker.ts` — activity tracking, periodic pruning,
  toolbar badge.
- `src/popup/` — quick-glance stats popup.
- `src/management/` — the full triage workspace (cluster cards, undo toast,
  filters), registered as the extension's options page.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server with extension HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint + Prettier check |
| `npm run icons:build` | Rasterize icon SVGs to PNGs |

## Known maintenance burden

Much lower than a page-scraping extension — `chrome.tabs` is a stable API,
not someone else's DOM. Domain-only clustering is intentionally simple and
should stay low-maintenance; further grouping within a busy domain is left
to the expand/collapse tab list rather than automatic sub-clustering.

## License

[MIT](LICENSE)

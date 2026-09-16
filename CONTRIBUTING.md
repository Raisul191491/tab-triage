# Contributing

## Local setup

```sh
npm install
npm run dev        # HMR dev build
npm run build      # production build to dist/
npm test           # unit tests
npm run lint       # ESLint + Prettier check
npm run format     # auto-fix formatting
```

Load `dist/` as an unpacked extension via `chrome://extensions` (Developer
mode → Load unpacked).

## Tuning clustering

Domain-grouping logic lives in `src/lib/cluster.ts`. Clustering is
intentionally domain-only (no title-based sub-splitting) — if you're
tempted to add finer-grained grouping, dogfood it against your own real
open tabs first, since clustering quality is a UX judgment call rather than
something the unit tests alone can validate.

## Branches & commits

- `main` is protected; open a PR even for small fixes.
- Branch names: `feat/short-description`, `fix/short-description`.
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `chore:`, `docs:`, `test:`.

## Before opening a PR

- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] Manually verified against a real tab session (not just synthetic
      fixtures) if clustering/staleness logic changed

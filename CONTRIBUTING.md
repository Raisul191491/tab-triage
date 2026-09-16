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

The title-similarity threshold and domain-grouping logic live in
`src/lib/cluster.ts`. Since clustering quality is a UX judgment call rather
than a correctness bug, dogfood any threshold change against your own real
open tabs before committing to it, in addition to the unit tests.

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

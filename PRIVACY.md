# Privacy Policy — Tab Triage

_Last updated: 2026-09-17_

## Summary

This extension collects **no data**. Nothing you do ever leaves your
browser, and no page content is ever read.

## What the extension stores

- **Tab activity history** (which tabs you've opened/activated and when) is
  stored via `chrome.storage.local`, purely to score staleness. Records for
  closed tabs are pruned automatically.
- **Reading lists** you explicitly choose to save are stored via
  `chrome.storage.local` — URLs and titles only.
- **Settings** are stored via `chrome.storage.local`.

Nothing is synced across devices — tab state is inherently per-device, and
this extension deliberately does not use `chrome.storage.sync` for it.

## What the extension does NOT do

- No host permissions, no content scripts, no reading of page content —
  only tab **metadata** (URL, title, favicon, pinned/audible state) via the
  `tabs` API.
- No analytics, telemetry, or tracking of any kind.
- No network requests to any server.
- No selling or sharing of data — there is no data to sell or share.

## Permissions justification

| Permission | Why |
|---|---|
| `tabs` | Read tab URL/title/metadata to cluster and score them; close tabs you choose to close |
| `storage` | Persist activity history, settings, and saved reading lists locally |
| `alarms` | Periodically prune activity records for tabs that no longer exist |
| `tabGroups` | Create native Chrome tab groups from a cluster, when you choose to |

## Contact

Questions: open an issue on this repository.

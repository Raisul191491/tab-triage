# Manual QA Checklist

Run against your own real (messy) tab hoard before every release — synthetic
fixtures won't surface real-world title patterns.

- [ ] Domain clustering groups tabs on the same site sensibly
- [ ] Title-similarity splits a busy domain (e.g. GitHub) into distinct topic clusters
- [ ] Pinned tabs never show up as stale
- [ ] Audio-playing tabs never show up as stale
- [ ] Duplicate detection catches tabs that differ only by tracking params
- [ ] Duplicate detection does NOT flag genuinely different pages (e.g. paginated URLs)
- [ ] "Close stale" on a cluster closes only that cluster's tabs
- [ ] Undo restores exactly the tabs that were just closed, within the 8s window
- [ ] Undo does nothing (silently) after the window expires
- [ ] "Save as reading list" persists the list and closes the cluster
- [ ] Popup counts match the management page after a refresh
- [ ] Everything works correctly across multiple Chrome windows
- [ ] `chrome://` and `about:` tabs are not mis-clustered or crash the extension
- [ ] Toolbar badge appears only once tab count crosses the configured threshold
- [ ] Activity history survives a manual service-worker restart (chrome://extensions → terminate)

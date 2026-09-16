# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-09-17

### Added

- Tab clustering by domain + title-token similarity.
- Per-tab and per-cluster staleness scoring; pinned/audible tabs excluded.
- Duplicate-tab detection with URL normalization.
- Management page: cluster cards, filters (all/stale/duplicates), undo-able
  close actions, save-cluster-as-reading-list.
- Popup with live tab/stale/duplicate counts.
- Toolbar badge showing stale-tab count once open-tab count crosses a
  threshold.
- Zero host permissions — only `tabs`, `storage`, `alarms`, `tabGroups`.

import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json' with { type: 'json' }

export default defineManifest({
  manifest_version: 3,
  name: 'Tab Triage',
  version: pkg.version,
  description: 'Cluster your open tabs by topic and close the stale ones in one click.',
  // No host permissions at all — everything operates on tab metadata via
  // the tabs API, never page content.
  permissions: ['tabs', 'storage', 'alarms', 'tabGroups'],
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      16: 'public/icons/icon16.png',
      32: 'public/icons/icon32.png',
    },
  },
  options_page: 'src/management/index.html',
  icons: {
    16: 'public/icons/icon16.png',
    32: 'public/icons/icon32.png',
    48: 'public/icons/icon48.png',
    128: 'public/icons/icon128.png',
  },
})

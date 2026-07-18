// __APP_VERSION__/__BUILD_TIME__ are injected by vite.config.ts's `define`
// at build time (package.json version + short git hash, and an ISO build
// timestamp) — this is the one place the rest of the app reads them from,
// rather than referencing the raw globals directly.
export const APP_VERSION = __APP_VERSION__
export const BUILD_TIME = __BUILD_TIME__

/** Human-readable "v1.2.3+abc1234 · Jul 18, 2026, 3:45 PM" for display in the UI. */
export function formatBuildVersion(): string {
  const formattedTime = new Date(BUILD_TIME).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return `v${APP_VERSION} · ${formattedTime}`
}

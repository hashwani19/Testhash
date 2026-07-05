# Tasks — a Progressive Web App

An installable, offline-first task manager built with React, TypeScript, and
Vite. It runs in the browser and can be installed to the home screen on both
iOS and Android, where it behaves like a native app (own icon, splash/status
bar theming, full-screen standalone window, works with no network).

## Features

- **Installable** on iOS (Safari "Add to Home Screen") and Android/Chrome
  (native install prompt), plus desktop Chrome/Edge.
- **Offline-first** — a service worker precaches the app shell, so it loads
  with no network connection. Tasks are persisted to `localStorage` on-device.
- **Responsive, mobile-first UI** with safe-area handling for notches/home
  indicators.
- **Auto-updating** service worker — new deployments are picked up on next
  launch without an app-store review process.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. Note: the service worker also runs in dev
(`devOptions.enabled: true` in `vite.config.ts`) so install/offline behavior
can be tested without a production build.

### Production build

```bash
npm run build
npm run preview   # serve the built app locally
```

## Installing on a phone

The dev/preview server above is only reachable on your machine. To install
on an actual phone, deploy `dist/` to any static host with HTTPS (Vercel,
Netlify, GitHub Pages, Cloudflare Pages, etc.) — a valid TLS certificate is
required for service workers and install prompts to work, `localhost`
excepted.

**Android (Chrome):**
1. Open the deployed URL.
2. Tap the "Install" banner, or the ⋮ menu → **Add to Home screen**.

**iOS (Safari):**
1. Open the deployed URL in Safari (not Chrome — iOS requires Safari for
   this).
2. Tap the Share icon → **Add to Home Screen**.

Once installed, the app opens full-screen with no browser chrome and keeps
working offline.

## Project structure

```
src/
  components/   UI building blocks (task list, form, install/offline banners)
  hooks/        useTasks (state + persistence), useOnlineStatus, useInstallPrompt
  types.ts      Shared Task/Filter types
public/icons/   App icons (regular + maskable, generated from scripts/icon*.svg)
scripts/        Icon source SVGs + generation script (npm run icons, needs `sharp`)
```

PWA configuration (manifest, service worker/caching strategy) lives in
`vite.config.ts` via [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/).

## Regenerating icons

Icons are generated from `scripts/icon.svg` / `scripts/icon-maskable.svg`:

```bash
npm install -D sharp
node scripts/gen-icons.mjs
```

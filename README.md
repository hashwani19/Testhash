# Eye Care Records — a Progressive Web App

An installable, offline-first patient records app for eye care, built with
React, TypeScript, and Vite. It runs in the browser and can be installed to
the home screen on both iOS and Android, where it behaves like a native app
(own icon, splash/status bar theming, full-screen standalone window, works
with no network).

> **This build is local-storage-only, for initial testing.** There is no
> backend — patients, visits, groups, and even user accounts all live in the
> browser's `localStorage`, matching the schema in `docs/design.md` but
> without the server/database described there. See "Local-only test build"
> below before treating this as production-ready (no real auth, no
> multi-device sync, no attachments).

## Features

- **Patient records**: a human-facing **patient number** (`P-YYYYMMDD-NNNN`,
  date-seeded and monotonically increasing), name, date of birth, address,
  and gender. Age is computed automatically from the date of birth; if no
  DOB is provided, age can be entered manually instead.
- **Patient groups**: admin-managed categories (e.g. "Friends", "Family").
  Only admins can create/rename/delete groups; every role can assign a
  patient to an existing group.
- **Eye treatment history**: each patient can have any number of dated
  (date + time) visit records. Every visit captures **Distance** and
  **Reading** prescriptions — sphere, cylinder, axis, and visual acuity —
  independently for the **left** and **right** eye, plus add power, lenses,
  diagnosis, and treatment plan.
- **Search, filter, and sort**: search matches name or patient number
  (3+ characters); filter by group; sort newest-first (default) or by group.
- **Role-based access**: `admin`, `doctor`, and `front_desk` accounts.
  Front desk and doctors can create/edit patients and clinical records but
  can't delete anything or manage groups — see `docs/design.md` §4 for the
  full permission matrix.
- **Installable** on iOS (Safari "Add to Home Screen") and Android/Chrome
  (native install prompt), plus desktop Chrome/Edge.
- **Offline-first** — a service worker precaches the app shell, so it loads
  with no network connection.
- **Responsive, mobile-first UI** with safe-area handling for notches/home
  indicators.
- **Auto-updating** service worker — new deployments are picked up on next
  launch without an app-store review process.

## Local-only test build

There is no backend in this build. Three test accounts are seeded into
`localStorage` on first load:

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `admin123` | admin |
| `doctor@example.com` | `doctor123` | doctor |
| `frontdesk@example.com` | `frontdesk123` | front_desk |

These credentials are stored in plaintext in the browser and are **not
secure** — this is a throwaway setup for exercising the UI/roles/schema
before the real backend (`docs/design.md`) is built. Clearing site data /
`localStorage` resets everything, including these accounts.

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
  auth/         AuthProvider (localStorage-backed accounts/session)
  components/   Login, patient list/form/detail, visit form/history,
                 Manage Groups screen, install/offline banners
  hooks/        useAuth, usePatients, usePatientGroups, useEyeVisits
                (state + localStorage persistence), useOnlineStatus,
                useInstallPrompt
  utils/        age.ts (age from DOB), patientNumber.ts (ID generation),
                patientQuery.ts (search/filter/sort)
  types.ts      Shared User / Patient / PatientGroup / EyeVisit types
public/icons/   App icons (regular + maskable, generated from scripts/icon*.svg)
scripts/        Icon source SVGs + generation script
docs/design.md  Target backend-synced architecture and schema
```

PWA configuration (manifest, service worker/caching strategy) lives in
`vite.config.ts` via [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/).

## Regenerating icons

Icons are generated from `scripts/icon.svg` / `scripts/icon-maskable.svg`:

```bash
npm install -D sharp
node scripts/gen-icons.mjs
```

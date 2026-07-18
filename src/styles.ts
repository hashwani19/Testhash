// Shared Tailwind utility strings — a single source of truth for the handful
// of UI patterns (fields, cards, headings) that repeat across every screen,
// so tweaking one doesn't mean hunting down every place it's duplicated.
// Button styling lives in components/Button.tsx and text-entry field styling
// lives in components/fieldBase.ts, not here — every button and form field
// in the app renders through one of those shared components.

export const card = 'bg-surface border border-border rounded-2xl p-4 shadow-card'

// The one dimmed-backdrop treatment behind any full-screen overlay (the
// hamburger nav drawer, ConfirmModal) — a single source of truth so a
// confirmation dialog and the nav drawer always dim the page behind them
// the same way, rather than each picking its own opacity.
export const dimmedBackdrop = 'bg-black/50'

// Shared type scale. pageTitle is the app's brand-name heading, used both
// on the login splash and in the in-app header — it's allowed to wrap
// onto two lines there rather than shrinking or truncating to fit next to
// the hamburger/profile icons. screenHeading is a full-screen section
// title (Manage Groups, Activity, Appointments, ...).
export const pageTitle = 'text-[22px] font-bold text-text-h'
export const screenHeading = 'text-xl font-bold text-text-h'

export const fieldLabel = 'flex flex-1 min-w-0 flex-col gap-1.5'
export const fieldLabelText = 'text-[13px] text-text'

// Caps a screen's content column at a comfortable reading width once there's
// room to spare (md:+) — for screens that are a single form or a flat list
// with no natural multi-column content (Preferences, Manage Groups), so
// they don't stretch full-width and read as sparse on a laptop screen.
// Screens with real multi-column content (Analytics' chart grid, the
// master-detail list+detail screens) don't use this — they have their own
// width logic instead.
export const narrowContent = 'md:max-w-xl'

export function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

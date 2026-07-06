// Shared Tailwind utility strings — a single source of truth for the handful
// of UI patterns (fields, cards, headings) that repeat across every screen,
// so tweaking one doesn't mean hunting down every place it's duplicated.
// Button styling lives in components/Button.tsx, not here — every button in
// the app renders through that component.

export const card = 'bg-surface border border-border rounded-2xl p-4 shadow-card'

// Shared type scale. pageTitle is the app's brand-name heading, used both
// on the login splash and in the in-app header — it's allowed to wrap
// onto two lines there rather than shrinking or truncating to fit next to
// the hamburger/profile icons. screenHeading is a full-screen section
// title (Manage Groups, Activity, Appointments, ...).
export const pageTitle = 'text-[22px] font-bold text-text-h'
export const screenHeading = 'text-xl font-bold text-text-h'

export const fieldLabel = 'flex flex-1 min-w-0 flex-col gap-1.5'
export const fieldLabelText = 'text-[13px] text-text'
export const fieldInput =
  'min-w-0 rounded-[10px] border border-border bg-bg px-3 py-2.5 text-text-h text-base font-[inherit] resize-y ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 ' +
  'disabled:opacity-60'

export function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

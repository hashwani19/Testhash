// Shared Tailwind utility strings — a single source of truth for the handful
// of UI patterns (buttons, fields, cards) that repeat across every screen, so
// tweaking one doesn't mean hunting down every place it's duplicated.

export const card = 'bg-surface border border-border rounded-2xl p-4 shadow-card'

// Shared type scale. pageTitle is the app's brand-name heading, used both
// on the login splash and in the in-app header — it's allowed to wrap
// onto two lines there rather than shrinking or truncating to fit next to
// the hamburger/profile icons. screenHeading is a full-screen section
// title (Manage Groups, Activity, Appointments, ...).
export const pageTitle = 'text-[22px] font-bold text-text-h'
export const screenHeading = 'text-xl font-bold text-text-h'

// Fixed-size circular touch target shared by header icon buttons (hamburger,
// profile avatar) so they line up regardless of their internal content.
export const iconButtonBase = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full cursor-pointer'
export const iconButton = `${iconButtonBase} border-none bg-transparent text-xl leading-none text-text-h`

export const fieldLabel = 'flex flex-1 min-w-0 flex-col gap-1.5'
export const fieldLabelText = 'text-[13px] text-text'
export const fieldInput =
  'min-w-0 rounded-[10px] border border-border bg-bg px-3 py-2.5 text-text-h text-base font-[inherit] resize-y ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 ' +
  'disabled:opacity-60'

const btnBase =
  'rounded-[10px] px-[18px] py-2.5 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-default'
export const btnPrimary = `${btnBase} bg-accent text-accent-contrast`
export const btnSecondary = `${btnBase} bg-bg text-text-h border border-border`
export const btnDanger = `${btnBase} bg-transparent text-high border border-high`
export const btnGhost =
  'rounded-lg px-3 py-1.5 text-[13px] font-semibold bg-accent text-accent-contrast whitespace-nowrap cursor-pointer'
export const btnLink =
  'bg-transparent border-none text-text underline text-[13px] self-start py-2 cursor-pointer'
export const btnIcon = 'bg-transparent border-none text-text text-xl leading-none cursor-pointer px-2 py-1'

export function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

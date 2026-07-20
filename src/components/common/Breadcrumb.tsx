import { Button } from './Button'

interface Props {
  /** Defaults to "All patients" — the one destination every screen using
   *  this backs out to today. Override if a future screen ever needs to
   *  return somewhere else. */
  label?: string
  onClick: () => void
}

/**
 * The one place every "back up a level" control renders through (Patient
 * Detail, Preferences, the Coming Soon placeholder screens).
 * Deliberately styled larger, bolder, and in the accent color rather than
 * as a plain underlined text link — it's the primary way back to the list
 * from a full-screen detail view, not an incidental inline link, so it
 * should read as a real navigation control at a glance.
 */
export function Breadcrumb({ label = 'All patients', onClick }: Props) {
  return (
    <Button
      variant="unstyled"
      onClick={onClick}
      className="flex w-fit cursor-pointer items-center gap-1 self-start py-1 text-[15px] font-semibold text-accent"
    >
      <span aria-hidden="true">‹</span>
      {label}
    </Button>
  )
}

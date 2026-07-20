import type { ReactNode } from 'react'
import { screenHeading } from '../../styles'

interface Props {
  title: string
  /** Typically a single primary `<Button>` (e.g. "Add tenant"), right-aligned
   *  next to the title. Omit for a header with just a title. */
  action?: ReactNode
}

/**
 * Title + optional right-aligned action button — the header row every
 * search+list screen with an admin "add" action opens with (Tenants,
 * Users, Patients). Pulled out once so the row's exact markup/spacing
 * can't drift between screens that all need the same shape.
 */
export function ScreenHeader({ title, action }: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className={screenHeading}>{title}</h2>
      {action}
    </div>
  )
}

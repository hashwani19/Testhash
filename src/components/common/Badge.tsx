import type { ReactNode } from 'react'
import { cx } from '../../styles'

interface Props {
  children: ReactNode
  className?: string
}

/** Small pill label — e.g. a patient's group, a role, or an appointment's
 *  "New patient" flag. `self-start` so it hugs its content rather than
 *  stretching to fill a flex-column parent when placed on its own line. */
export function Badge({ children, className }: Props) {
  return (
    <span
      className={cx(
        'w-fit self-start rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] font-medium text-text',
        className,
      )}
    >
      {children}
    </span>
  )
}

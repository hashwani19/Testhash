import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../styles'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

/** The one place every card-style surface in the app renders through. */
export function Card({ className, ...rest }: CardProps) {
  return (
    <div className={cx('rounded-xl border border-border bg-surface p-3.5 shadow-card', className)} {...rest} />
  )
}

interface CardHeaderProps {
  title: ReactNode
  actions?: ReactNode
}

/**
 * Title + trailing actions row for a Card (e.g. a record's date plus its
 * Edit/Delete buttons). Centralizing this row is what guarantees the
 * actions actually line up with each other and with the title, instead of
 * every card hand-rolling its own flex row and drifting out of alignment
 * whenever an icon and a text button end up with different font metrics.
 */
export function CardHeader({ title, actions }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-semibold text-text-h">{title}</span>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  )
}

import type { ElementType, HTMLAttributes, ReactNode } from 'react'
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
  /** Defaults to the visit-record look (text-sm font-semibold) — pass a
   *  larger size for cards where the title is the primary heading (e.g. a
   *  patient's name). */
  titleClassName?: string
  /** Host element for the title. Defaults to 'span'; pass 'h2' etc. where
   *  the title should be a real document heading. */
  titleAs?: ElementType
  actions?: ReactNode
}

/**
 * Title + trailing actions row for a Card (e.g. a record's date plus its
 * Edit/Delete buttons). Centralizing this row is what guarantees the
 * actions actually line up with each other and with the title, instead of
 * every card hand-rolling its own flex row and drifting out of alignment
 * whenever an icon and a text button end up with different font metrics.
 */
export function CardHeader({
  title,
  titleClassName = 'text-sm font-semibold text-text-h',
  titleAs: TitleTag = 'span',
  actions,
}: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <TitleTag className={titleClassName}>{title}</TitleTag>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  )
}

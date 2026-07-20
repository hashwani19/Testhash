import type { ReactNode } from 'react'
import { cx, narrowContent } from '../../styles'

interface Props {
  children: ReactNode
  /**
   * Defaults to `'narrow'` — caps content at a comfortable reading width
   * once there's room to spare (`md:`+), matching docs/design.md §8.0.
   * Every single-form or flat-list screen (Preferences, Users, Tenants,
   * ...) should use the default rather than stretching
   * edge-to-edge on a tablet/laptop. Pass `'wide'` only for a screen with
   * genuine multi-column content of its own (a search+list screen,
   * Analytics' chart grid) that manages its own width instead.
   *
   * This is the one place that decision gets made — a new screen that
   * wraps its content in `<Screen>` gets the right width behavior at every
   * breakpoint for free, without needing to know `narrowContent` exists.
   */
  width?: 'narrow' | 'wide'
  /** Layout classes the caller still owns (gap size, etc.) — kept out of
   *  this component so there's exactly one source of truth for them
   *  rather than a default here that a className override has to fight. */
  className?: string
}

export function Screen({ children, width = 'narrow', className }: Props) {
  return <div className={cx('flex flex-col', width === 'narrow' && narrowContent, className)}>{children}</div>
}

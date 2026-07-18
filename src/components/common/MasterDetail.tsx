import type { ReactNode } from 'react'
import { cx } from '../../styles'

interface Props {
  master: ReactNode
  detail: ReactNode
  /** Whether a detail item is currently open — governs single-pane
   *  visibility below lg: (master when false, detail when true). At lg:+
   *  both panes stay mounted and visible side by side regardless. */
  showDetail: boolean
}

/**
 * Two-pane list+detail layout for lg:+ (tablet landscape/laptop), collapsing
 * to today's one-screen-at-a-time behavior below that — CSS decides which
 * pane shows at narrow widths, not the caller's view state, so screens using
 * this don't need a separate mobile/desktop render path.
 */
export function MasterDetail({ master, detail, showDetail }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      <div
        className={cx(
          'flex-col gap-4 lg:flex lg:w-[360px] lg:shrink-0',
          showDetail ? 'hidden' : 'flex',
        )}
      >
        {master}
      </div>
      <div className={cx('min-w-0 flex-col gap-4 lg:flex lg:flex-1', showDetail ? 'flex' : 'hidden')}>
        {detail}
      </div>
    </div>
  )
}

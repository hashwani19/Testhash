import { useEffect, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import { Button } from './Button'
import { cx } from '../../styles'

interface Props {
  /** Renders the trigger control; receives the click handler that toggles the panel open. */
  trigger: (props: { onClick: () => void; open: boolean }) => ReactNode
  /** Renders the panel's contents; receives a `close` callback for items that should dismiss it. */
  children: (props: { close: () => void }) => ReactNode
  /** Which side of the trigger the panel hangs from. Defaults to 'left'. */
  align?: 'left' | 'right'
  /** Tailwind width class for the panel. Defaults to 'w-56'. */
  widthClassName?: string
  /** Extra classes for the panel (padding/gap are left to the caller since they vary). */
  panelClassName?: string
  /** Host element for the panel — 'nav' for navigation menus, 'div' otherwise. */
  as?: ElementType
  /** Dim + blur the backdrop instead of leaving it invisible (used for the full-screen nav drawer). */
  dimBackdrop?: boolean
  /** Lock page scroll while open (used for the full-screen nav drawer). */
  lockScroll?: boolean
  /** aria-label for the backdrop's close button. */
  closeLabel?: string
}

/**
 * The one place every trigger-a-panel popover in the app renders through
 * (hamburger nav drawer, profile menu, search filter/sort). Owns its own
 * open state, the full-viewport backdrop that closes it on outside click,
 * and the positioned panel — callers only supply the trigger control and
 * the panel's contents.
 */
export function Dropdown({
  trigger,
  children,
  align = 'left',
  widthClassName = 'w-56',
  panelClassName = 'gap-1 p-3',
  as: Panel = 'div',
  dimBackdrop = false,
  lockScroll = false,
  closeLabel = 'Close menu',
}: Props) {
  const [open, setOpen] = useState(false)

  // Lock body scroll while open so the page behind a full-screen drawer
  // can't be scrolled — the backdrop already blocks clicks, but wheel/touch
  // scroll bubbles past it to the document by default.
  useEffect(() => {
    if (!lockScroll || !open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [lockScroll, open])

  const close = () => setOpen(false)

  return (
    <div className="relative shrink-0">
      {trigger({ onClick: () => setOpen((o) => !o), open })}

      {open && (
        <>
          <Button
            variant="unstyled"
            className={cx(
              'fixed inset-0 z-40 cursor-default border-none',
              dimBackdrop ? 'bg-black/15 backdrop-blur-[2px]' : 'bg-transparent',
            )}
            aria-label={closeLabel}
            onClick={close}
          />
          <Panel
            className={cx(
              'absolute top-full z-50 mt-2 flex max-h-[70vh] flex-col overflow-y-auto rounded-xl border border-border bg-surface shadow-card',
              align === 'left' ? 'left-0' : 'right-0',
              widthClassName,
              panelClassName,
            )}
          >
            {children({ close })}
          </Panel>
        </>
      )}
    </div>
  )
}

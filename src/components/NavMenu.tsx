import { useEffect } from 'react'
import type { Role } from '../types'
import { cx } from '../styles'

export type NavTarget = 'patients' | 'groups' | 'activity' | 'appointments'

const NAV_ITEMS: Array<{ target: NavTarget; label: string; adminOnly?: boolean }> = [
  { target: 'patients', label: 'Patients' },
  { target: 'groups', label: 'Groups', adminOnly: true },
  { target: 'activity', label: 'Activity', adminOnly: true },
  { target: 'appointments', label: 'Appointments' },
]

interface Props {
  open: boolean
  role: Role
  active: NavTarget
  onNavigate: (target: NavTarget) => void
  onSignOut: () => void
  onClose: () => void
}

export function NavMenu({ open, role, active, onNavigate, onSignOut, onClose }: Props) {
  // Lock body scroll while the drawer is open so the page behind it can't be
  // scrolled — the transparent backdrop already blocks clicks, but wheel/touch
  // scroll bubbles past it to the document by default.
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (!open) return null

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin')

  return (
    <>
      <button
        className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
        aria-label="Close menu"
        onClick={onClose}
      />
      <nav className="absolute left-0 top-full z-50 mt-2 flex max-h-[70vh] w-56 flex-col gap-1 overflow-y-auto rounded-xl border border-border bg-surface p-3 shadow-card">
        {items.map((item) => (
          <button
            key={item.target}
            className={cx(
              'cursor-pointer rounded-lg border-none px-3 py-2.5 text-left text-[15px] font-medium',
              item.target === active ? 'bg-accent text-accent-contrast' : 'bg-transparent text-text-h',
            )}
            onClick={() => {
              onNavigate(item.target)
              onClose()
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          className="mt-1 cursor-pointer rounded-lg border-t border-border bg-transparent px-3 pb-2.5 pt-3 text-left text-[15px] font-medium text-text-h"
          onClick={() => {
            onClose()
            onSignOut()
          }}
        >
          Sign out
        </button>
      </nav>
    </>
  )
}

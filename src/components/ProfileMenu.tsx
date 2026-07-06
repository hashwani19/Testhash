import { useState } from 'react'
import type { Role } from '../types'
import { iconButtonBase } from '../styles'

interface Props {
  fullName: string
  role: Role
  onSignOut: () => void
}

function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function ProfileMenu({ fullName, role, onSignOut }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative shrink-0">
      <button
        className={`${iconButtonBase} border border-border bg-bg text-sm font-semibold text-text-h`}
        aria-label="Profile menu"
        onClick={() => setOpen((o) => !o)}
      >
        {initials(fullName)}
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
            aria-label="Close profile menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 flex w-56 max-h-[70vh] flex-col gap-1 overflow-y-auto rounded-xl border border-border bg-surface p-3 shadow-card">
            <p className="px-1 text-sm font-semibold text-text-h">{fullName}</p>
            <span className="mx-1 mb-1 w-fit rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] capitalize text-text">
              {role}
            </span>
            <button
              className="mt-1 cursor-pointer rounded-lg border-t border-border bg-transparent px-3 pb-2.5 pt-3 text-left text-[15px] font-medium text-text-h"
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

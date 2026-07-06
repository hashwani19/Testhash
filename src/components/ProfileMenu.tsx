import type { Role } from '../types'
import { Button } from './common/Button'
import { Dropdown } from './common/Dropdown'

interface Props {
  fullName: string
  role: Role
  onOpenPreferences: () => void
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

export function ProfileMenu({ fullName, role, onOpenPreferences, onSignOut }: Props) {
  return (
    <Dropdown
      align="right"
      closeLabel="Close profile menu"
      trigger={({ onClick }) => (
        <Button
          variant="iconCircle"
          className="border border-border bg-bg text-sm font-semibold text-text-h"
          aria-label="Profile menu"
          onClick={onClick}
        >
          {initials(fullName)}
        </Button>
      )}
    >
      {({ close }) => (
        <>
          <p className="px-1 text-sm font-semibold text-text-h">{fullName}</p>
          <span className="mx-1 mb-1 w-fit rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] capitalize text-text">
            {role}
          </span>
          <Button
            variant="unstyled"
            className="mt-1 cursor-pointer rounded-lg border-t border-border bg-transparent px-3 pt-3 pb-1.5 text-left text-[15px] font-medium text-text-h"
            onClick={() => {
              close()
              onOpenPreferences()
            }}
          >
            Preferences
          </Button>
          <Button
            variant="unstyled"
            className="cursor-pointer rounded-lg bg-transparent px-3 pt-1.5 pb-2.5 text-left text-[15px] font-medium text-text-h"
            onClick={() => {
              close()
              onSignOut()
            }}
          >
            Sign out
          </Button>
        </>
      )}
    </Dropdown>
  )
}

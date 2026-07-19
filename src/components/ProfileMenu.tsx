import type { Role } from '../types'
import { formatBuildVersion } from '../buildInfo'
import { formatRole } from '../utils/roles'
import { Button } from './common/Button'
import { Dropdown } from './common/Dropdown'
import { cx } from '../styles'

interface Props {
  fullName: string
  roles: Role[]
  /** Omitted for anyone but a tenant `admin` — preferences (both the
   *  clinic-wide settings and the personal theme/list-size ones) are
   *  admin-only, so the menu item doesn't render for other roles. */
  onOpenPreferences?: () => void
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

export function ProfileMenu({ fullName, roles, onOpenPreferences, onSignOut }: Props) {
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
          <span className="mx-1 mb-1 flex flex-wrap gap-1">
            {roles.map((role) => (
              <span
                key={role}
                className="w-fit rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] capitalize text-text"
              >
                {formatRole(role)}
              </span>
            ))}
          </span>
          {onOpenPreferences && (
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
          )}
          <Button
            variant="unstyled"
            className={cx(
              'cursor-pointer rounded-lg bg-transparent px-3 pt-1.5 pb-2.5 text-left text-[15px] font-medium text-text-h',
              !onOpenPreferences && 'mt-1 border-t border-border pt-3',
            )}
            onClick={() => {
              close()
              onSignOut()
            }}
          >
            Sign out
          </Button>
          <p className="border-t border-border px-3 pt-1.5 pb-1 text-[11px] text-text">
            {formatBuildVersion()}
          </p>
        </>
      )}
    </Dropdown>
  )
}

import type { Role } from '../types'
import { Button } from './common/Button'
import { Dropdown } from './common/Dropdown'
import { cx } from '../styles'

export type NavTarget = 'patients' | 'groups' | 'activity' | 'appointments'

const NAV_ITEMS: Array<{ target: NavTarget; label: string; adminOnly?: boolean }> = [
  { target: 'patients', label: 'Patients' },
  { target: 'groups', label: 'Groups', adminOnly: true },
  { target: 'activity', label: 'Activity', adminOnly: true },
  { target: 'appointments', label: 'Appointments' },
]

interface Props {
  role: Role
  active: NavTarget
  onNavigate: (target: NavTarget) => void
  onSignOut: () => void
}

export function NavMenu({ role, active, onNavigate, onSignOut }: Props) {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin')

  return (
    <Dropdown
      align="left"
      as="nav"
      dimBackdrop
      lockScroll
      closeLabel="Close menu"
      trigger={({ onClick }) => (
        <Button
          variant="iconCircle"
          className="border-none bg-transparent text-xl leading-none text-text-h"
          aria-label="Open menu"
          onClick={onClick}
        >
          ☰
        </Button>
      )}
    >
      {({ close }) => (
        <>
          {items.map((item) => (
            <Button
              key={item.target}
              variant="unstyled"
              className={cx(
                'cursor-pointer rounded-lg border-none px-3 py-2.5 text-left text-[15px] font-medium',
                item.target === active ? 'bg-accent text-accent-contrast' : 'bg-transparent text-text-h',
              )}
              onClick={() => {
                onNavigate(item.target)
                close()
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            variant="unstyled"
            className="mt-1 cursor-pointer rounded-lg border-t border-border bg-transparent px-3 pb-2.5 pt-3 text-left text-[15px] font-medium text-text-h"
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

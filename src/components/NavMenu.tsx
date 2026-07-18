import type { Role } from '../types'
import { Button } from './common/Button'
import { Dropdown } from './common/Dropdown'
import { cx } from '../styles'

export type NavTarget = 'patients' | 'groups' | 'activity' | 'appointments' | 'analytics'

const NAV_ITEMS: Array<{ target: NavTarget; label: string; roles?: Role[] }> = [
  { target: 'patients', label: 'Patients' },
  { target: 'groups', label: 'Groups', roles: ['admin'] },
  { target: 'activity', label: 'Activity', roles: ['admin'] },
  { target: 'appointments', label: 'Appointments' },
  { target: 'analytics', label: 'Analytics', roles: ['admin', 'doctor'] },
]

interface Props {
  role: Role
  active: NavTarget
  onNavigate: (target: NavTarget) => void
}

export function NavMenu({ role, active, onNavigate }: Props) {
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <Dropdown
      align="left"
      as="nav"
      dimBackdrop
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
        </>
      )}
    </Dropdown>
  )
}

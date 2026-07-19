import type { Role } from '../types'
import type { NavTarget } from '../nav'
import { NAV_ITEMS } from '../nav'
import { Button } from './common/Button'
import { Dropdown } from './common/Dropdown'
import { cx } from '../styles'

interface Props {
  roles: Role[]
  active: NavTarget
  onNavigate: (target: NavTarget) => void
}

export function NavMenu({ roles, active, onNavigate }: Props) {
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.some((r) => roles.includes(r)))

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

import type { Role } from '../types'
import type { NavTarget } from '../nav'
import { NAV_ITEMS } from '../nav'
import { Button } from './common/Button'
import { pageTitle, cx } from '../styles'

interface Props {
  role: Role
  active: NavTarget
  onNavigate: (target: NavTarget) => void
}

/**
 * Persistent left sidebar nav, visible only at `md:` and up (docs/design.md
 * §8.2) — replaces NavMenu's tap-to-open drawer once there's enough width
 * for navigation to just stay on screen rather than being tucked away.
 * Shares `NAV_ITEMS` with NavMenu so the two never list different
 * destinations. Hover states are worth it here specifically because this
 * only ever renders at pointer-friendly widths, unlike the touch-first
 * drawer it replaces.
 */
export function NavRail({ role, active, onNavigate }: Props) {
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border p-4 md:flex">
      <p className={`mb-2 px-3 ${pageTitle}`}>Ortho and Vision Care</p>
      {items.map((item) => (
        <Button
          key={item.target}
          variant="unstyled"
          className={cx(
            'cursor-pointer rounded-lg border-none px-3 py-2.5 text-left text-[15px] font-medium',
            item.target === active
              ? 'bg-accent text-accent-contrast'
              : 'bg-transparent text-text-h hover:bg-bg',
          )}
          onClick={() => onNavigate(item.target)}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  )
}

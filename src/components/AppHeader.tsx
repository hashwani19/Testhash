import type { Role } from '../types'
import { NavMenu } from './NavMenu'
import type { NavTarget } from './NavMenu'
import { ProfileMenu } from './ProfileMenu'
import { pageTitle } from '../styles'

interface Props {
  subtitle: string
  fullName: string
  role: Role
  activeNavTarget: NavTarget
  onNavigate: (target: NavTarget) => void
  onSignOut: () => void
}

export function AppHeader({ subtitle, fullName, role, activeNavTarget, onNavigate, onSignOut }: Props) {
  return (
    <header className="px-5 pt-7 pb-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <NavMenu role={role} active={activeNavTarget} onNavigate={onNavigate} onSignOut={onSignOut} />

          <h1 className={`min-w-0 flex-1 ${pageTitle}`}>Ortho and Vision Care</h1>
        </div>

        <ProfileMenu fullName={fullName} role={role} onSignOut={onSignOut} />
      </div>
      <p className="mt-1 text-sm text-text">{subtitle}</p>
    </header>
  )
}

import { useState } from 'react'
import type { Role } from '../types'
import { NavMenu } from './NavMenu'
import type { NavTarget } from './NavMenu'
import { ProfileMenu } from './ProfileMenu'
import { appBarTitle, iconButton } from '../styles'

interface Props {
  subtitle: string
  fullName: string
  role: Role
  activeNavTarget: NavTarget
  onNavigate: (target: NavTarget) => void
  onSignOut: () => void
}

export function AppHeader({ subtitle, fullName, role, activeNavTarget, onNavigate, onSignOut }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="px-5 pt-7 pb-2">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex min-w-0 flex-1 items-center gap-2">
          <button className={iconButton} aria-label="Open menu" onClick={() => setMenuOpen((o) => !o)}>
            ☰
          </button>
          <h1 className={`min-w-0 flex-1 truncate ${appBarTitle}`}>Ortho and Vision Care</h1>

          <NavMenu
            open={menuOpen}
            role={role}
            active={activeNavTarget}
            onNavigate={onNavigate}
            onSignOut={onSignOut}
            onClose={() => setMenuOpen(false)}
          />
        </div>

        <ProfileMenu fullName={fullName} role={role} onSignOut={onSignOut} />
      </div>
      <p className="mt-1 text-sm text-text">{subtitle}</p>
    </header>
  )
}

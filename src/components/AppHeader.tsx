import type { Role } from '../types'
import type { NavTarget } from '../nav'
import { NavMenu } from './NavMenu'
import { ProfileMenu } from './ProfileMenu'
import { pageTitle } from '../styles'

interface Props {
  fullName: string
  roles: Role[]
  activeNavTarget: NavTarget
  onNavigate: (target: NavTarget) => void
  onOpenPreferences?: () => void
  onSignOut: () => void
}

export function AppHeader({
  fullName,
  roles,
  activeNavTarget,
  onNavigate,
  onOpenPreferences,
  onSignOut,
}: Props) {
  return (
    <header className="px-5 pt-7 pb-2 md:px-8 md:pt-6">
      <div className="flex items-center justify-between gap-3 md:justify-end">
        {/* NavRail (md:+) carries both the app title and navigation in the
         * sidebar instead — duplicating them up here too would be noise. */}
        <div className="flex min-w-0 flex-1 items-center gap-2 md:hidden">
          <NavMenu roles={roles} active={activeNavTarget} onNavigate={onNavigate} />

          <h1 className={`min-w-0 flex-1 ${pageTitle}`}>Ortho and Vision Care</h1>
        </div>

        <ProfileMenu
          fullName={fullName}
          roles={roles}
          onOpenPreferences={onOpenPreferences}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  )
}

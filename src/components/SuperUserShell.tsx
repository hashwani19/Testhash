import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AppHeader } from './AppHeader'
import { NavRail } from './NavRail'
import { ConfirmModal } from './ConfirmModal'
import { TenantsScreen } from './TenantsScreen'

/**
 * The superuser's entire app (§5.5 of docs/design.md) — reuses NavRail/
 * AppHeader/ProfileMenu (their NAV_ITEMS role-filtering already limits the
 * superuser to "Tenants" alone, per spec) but skips every tenant-scoped
 * provider (patients, appointments, prescription template, ...) that
 * `AppShell` mounts, since none of it applies to a platform-level account.
 */
export function SuperUserShell() {
  const { user, logout } = useAuth()
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)

  if (!user) return null

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[560px] flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] md:max-w-[1440px] md:flex-row">
      <NavRail role={user.role} active="tenants" onNavigate={() => {}} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          fullName={user.fullName}
          role={user.role}
          activeNavTarget="tenants"
          onNavigate={() => {}}
          onSignOut={() => setConfirmingSignOut(true)}
        />

        {confirmingSignOut && (
          <ConfirmModal
            title="Sign out?"
            warning="You'll need to sign back in to manage tenants."
            mode="yesNo"
            confirmLabel="Sign out"
            onConfirm={() => {
              setConfirmingSignOut(false)
              logout()
            }}
            onCancel={() => setConfirmingSignOut(false)}
          />
        )}

        <main className="flex flex-1 flex-col gap-4 px-5 pb-10 pt-3 md:px-8 md:pt-[26px] lg:px-10">
          <TenantsScreen />
        </main>
      </div>
    </div>
  )
}

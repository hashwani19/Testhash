import type { Role } from './types'

export type NavTarget = 'patients' | 'activity' | 'appointments' | 'analytics' | 'users' | 'tenants'

const TENANT_ROLES: Role[] = ['admin', 'doctor', 'front_desk']

/** Shared by NavMenu (phone drawer) and NavRail (md:+ persistent sidebar)
 *  so the two destination lists can't drift apart. Lives outside any
 *  component file so exporting it doesn't break Fast Refresh. Every item
 *  needs an explicit `roles` list — an unset list would show for every
 *  role, including `super_user`, which should only ever see "Tenants"
 *  (docs/design.md §5.5). */
export const NAV_ITEMS: Array<{ target: NavTarget; label: string; roles?: Role[] }> = [
  { target: 'patients', label: 'Patients', roles: TENANT_ROLES },
  { target: 'appointments', label: 'Appointments', roles: TENANT_ROLES },
  { target: 'analytics', label: 'Analytics', roles: ['admin', 'doctor'] },
  { target: 'activity', label: 'Activity', roles: ['admin'] },
  { target: 'users', label: 'Users', roles: ['admin'] },
  { target: 'tenants', label: 'Tenants', roles: ['super_user'] },
]

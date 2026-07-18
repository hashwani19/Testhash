import type { Role } from './types'

export type NavTarget = 'patients' | 'groups' | 'activity' | 'appointments' | 'analytics'

/** Shared by NavMenu (phone drawer) and NavRail (md:+ persistent sidebar)
 *  so the two destination lists can't drift apart. Lives outside any
 *  component file so exporting it doesn't break Fast Refresh. */
export const NAV_ITEMS: Array<{ target: NavTarget; label: string; roles?: Role[] }> = [
  { target: 'patients', label: 'Patients' },
  { target: 'groups', label: 'Groups', roles: ['admin'] },
  { target: 'activity', label: 'Activity', roles: ['admin'] },
  { target: 'appointments', label: 'Appointments' },
  { target: 'analytics', label: 'Analytics', roles: ['admin', 'doctor'] },
]

import type { Role } from '../types'

/** "front_desk" -> "front desk" — pair with a `capitalize` class for display. */
export function formatRole(role: Role): string {
  return role.replace('_', ' ')
}

/** The three tenant-scoped roles a tenant admin can assign — excludes
 *  `super_user`, which is never assignable through the Users screen.
 *  Lives outside `RoleCheckboxes.tsx` so exporting it doesn't break that
 *  component's Fast Refresh. */
export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'front_desk', label: 'Front desk' },
]

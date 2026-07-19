import type { Role } from '../types'

/** "front_desk" -> "front desk" — pair with a `capitalize` class for display. */
export function formatRole(role: Role): string {
  return role.replace('_', ' ')
}

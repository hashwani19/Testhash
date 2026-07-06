import type { AuditEntityType, AuditLogEntry } from '../types'
import { MIN_SEARCH_LENGTH } from './patientQuery'
import { dateOnlyFromTimestamp } from './date'

export interface AuditLogQuery {
  search?: string
  entityType?: AuditEntityType | 'all'
  actorUserId?: string
  from?: string
  to?: string
}

/** Always reverse-chronological (§8.9) — there's no user-selectable sort
 *  for this screen, unlike the patient/appointment lists. */
export function queryAuditLog(
  entries: AuditLogEntry[],
  { search, entityType = 'all', actorUserId, from, to }: AuditLogQuery,
): AuditLogEntry[] {
  const trimmedSearch = search?.trim() ?? ''
  const q = trimmedSearch.length >= MIN_SEARCH_LENGTH ? trimmedSearch.toLowerCase() : ''

  const result = entries.filter((entry) => {
    if (
      q &&
      !entry.actorName.toLowerCase().includes(q) &&
      !entry.entityLabel.toLowerCase().includes(q)
    ) {
      return false
    }
    if (entityType !== 'all' && entry.entityType !== entityType) return false
    if (actorUserId && entry.actorUserId !== actorUserId) return false
    if (from || to) {
      const entryDate = dateOnlyFromTimestamp(entry.createdAt)
      if (from && entryDate < from) return false
      if (to && entryDate > to) return false
    }
    return true
  })

  return [...result].sort((a, b) => b.createdAt - a.createdAt)
}

import { useMemo, useState } from 'react'
import type { AuditEntityType, AuditLogEntry } from '../types'
import { queryAuditLog } from '../utils/auditLogQuery'

/**
 * Owns the Activity screen's search/filter state and returns the matching
 * entries — mirrors usePatientQuery/useAppointmentQuery's seam so a later
 * swap to a server-backed `GET /audit-log?...` (§6) only changes the body
 * of the `useMemo` below.
 */
export function useAuditLogQuery(entries: AuditLogEntry[]) {
  const [search, setSearch] = useState('')
  const [entityType, setEntityType] = useState<AuditEntityType | 'all'>('all')
  const [actorUserId, setActorUserId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const results = useMemo(
    () => queryAuditLog(entries, { search, entityType, actorUserId, from, to }),
    [entries, search, entityType, actorUserId, from, to],
  )

  const resetFilters = () => {
    setEntityType('all')
    setActorUserId('')
    setFrom('')
    setTo('')
  }

  const isFilterActive = entityType !== 'all' || actorUserId !== '' || from !== '' || to !== ''

  return {
    search,
    setSearch,
    entityType,
    setEntityType,
    actorUserId,
    setActorUserId,
    from,
    setFrom,
    to,
    setTo,
    resetFilters,
    isFilterActive,
    results,
  }
}

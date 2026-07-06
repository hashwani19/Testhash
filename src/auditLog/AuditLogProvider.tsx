import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuditLogEntry } from '../types'
import { useAuth } from '../hooks/useAuth'
import { AuditLogContext } from './context'
import type { LogAuditEntryInput } from './context'

const STORAGE_KEY = 'testhash.auditLog.v1'

function loadEntries(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AuditLogEntry[]
  } catch {
    // fall through to an empty log
  }
  return []
}

/**
 * Client-side stand-in for the real backend's server-side write
 * interception (§10 of docs/design.md — genuine audit logging normally
 * happens on the API, never trusting the client). Every mutation hook
 * (usePatients/usePatientGroups/useEyeVisits/useAppointments) calls
 * `logEntry` itself right where it already mutates its own array, so an
 * entry gets recorded the same instant the real thing would happen server-
 * side — there's no separate interception layer to write since this app
 * has no server, only the hooks that already own each piece of data.
 *
 * Held in context (like every other shared store in this app, e.g.
 * PreferencesProvider) rather than a plain hook — every mutation hook and
 * the Activity screen must see the exact same entries list, not each its
 * own disconnected copy.
 */
export function AuditLogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<AuditLogEntry[]>(() => loadEntries())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const logEntry = useCallback(
    (input: LogAuditEntryInput) => {
      if (!user) return
      const entry: AuditLogEntry = {
        id: crypto.randomUUID(),
        actorUserId: user.id,
        actorName: user.fullName,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        entityLabel: input.entityLabel,
        beforeJson: input.before !== undefined ? JSON.stringify(input.before) : undefined,
        afterJson: input.after !== undefined ? JSON.stringify(input.after) : undefined,
        createdAt: Date.now(),
      }
      setEntries((prev) => [entry, ...prev])
    },
    [user],
  )

  return <AuditLogContext.Provider value={{ entries, logEntry }}>{children}</AuditLogContext.Provider>
}

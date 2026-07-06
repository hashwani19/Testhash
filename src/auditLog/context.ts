import { createContext } from 'react'
import type { AuditAction, AuditEntityType, AuditLogEntry } from '../types'

export interface LogAuditEntryInput {
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  /** Human-readable label for the affected record (e.g. a patient's name) —
   *  resolved once here, at write time, rather than re-resolved later by
   *  joining against live data that may no longer exist. */
  entityLabel: string
  /** The record's own fields before the change. Omit for `create`. */
  before?: unknown
  /** The record's own fields after the change. Omit for `delete`. */
  after?: unknown
}

export interface AuditLogContextValue {
  entries: AuditLogEntry[]
  logEntry: (input: LogAuditEntryInput) => void
}

export const AuditLogContext = createContext<AuditLogContextValue | null>(null)

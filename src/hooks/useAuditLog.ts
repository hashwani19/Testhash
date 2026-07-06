import { useContext } from 'react'
import { AuditLogContext } from '../auditLog/context'

export function useAuditLog() {
  const ctx = useContext(AuditLogContext)
  if (!ctx) throw new Error('useAuditLog must be used within AuditLogProvider')
  return ctx
}

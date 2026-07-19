import { useCallback } from 'react'
import type { PatientGroup } from '../types'
import { sanitizeText } from '../utils/sanitize'
import { DEFAULT_TENANT_ID, useTenantStorageState } from '../utils/tenantStorage'
import { SEED_GROUPS } from '../seedData'
import { useAuditLog } from './useAuditLog'

const BASE_STORAGE_KEY = 'testhash.patientGroups.v1'

function loadGroups(storageKey: string, tenantId: string): PatientGroup[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw) as PatientGroup[]
  } catch {
    // fall through to reseed
  }
  const seed = tenantId === DEFAULT_TENANT_ID ? SEED_GROUPS : []
  localStorage.setItem(storageKey, JSON.stringify(seed))
  return seed
}

export function usePatientGroups() {
  const [groups, setGroups] = useTenantStorageState<PatientGroup[]>(BASE_STORAGE_KEY, loadGroups)
  const { logEntry } = useAuditLog()

  const addGroup = useCallback(
    (name: string) => {
      const group: PatientGroup = {
        id: crypto.randomUUID(),
        name: sanitizeText(name),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      setGroups((prev) => [...prev, group].sort((a, b) => a.name.localeCompare(b.name)))
      logEntry({ action: 'create', entityType: 'patient_group', entityId: group.id, entityLabel: group.name, after: group })
      return group.id
    },
    [logEntry, setGroups],
  )

  const renameGroup = useCallback(
    (id: string, name: string) => {
      const before = groups.find((g) => g.id === id)
      if (!before) return
      const after: PatientGroup = { ...before, name: sanitizeText(name), updatedAt: Date.now() }
      setGroups((prev) => prev.map((g) => (g.id === id ? after : g)).sort((a, b) => a.name.localeCompare(b.name)))
      logEntry({ action: 'update', entityType: 'patient_group', entityId: id, entityLabel: after.name, before, after })
    },
    [groups, logEntry, setGroups],
  )

  const deleteGroup = useCallback(
    (id: string) => {
      const before = groups.find((g) => g.id === id)
      setGroups((prev) => prev.filter((g) => g.id !== id))
      if (before) {
        logEntry({ action: 'delete', entityType: 'patient_group', entityId: id, entityLabel: before.name, before })
      }
    },
    [groups, logEntry, setGroups],
  )

  return { groups, addGroup, renameGroup, deleteGroup }
}

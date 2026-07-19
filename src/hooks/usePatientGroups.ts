import { useCallback, useEffect, useState } from 'react'
import type { PatientGroup } from '../types'
import { sanitizeText } from '../utils/sanitize'
import { SEED_GROUPS } from '../seedData'
import { useAuditLog } from './useAuditLog'

const STORAGE_KEY = 'testhash.patientGroups.v1'

function loadGroups(): PatientGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PatientGroup[]
  } catch {
    // fall through to reseed
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_GROUPS))
  return SEED_GROUPS
}

export function usePatientGroups() {
  const [groups, setGroups] = useState<PatientGroup[]>(() => loadGroups())
  const { logEntry } = useAuditLog()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
  }, [groups])

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
    [logEntry],
  )

  const renameGroup = useCallback(
    (id: string, name: string) => {
      const before = groups.find((g) => g.id === id)
      if (!before) return
      const after: PatientGroup = { ...before, name: sanitizeText(name), updatedAt: Date.now() }
      setGroups((prev) => prev.map((g) => (g.id === id ? after : g)).sort((a, b) => a.name.localeCompare(b.name)))
      logEntry({ action: 'update', entityType: 'patient_group', entityId: id, entityLabel: after.name, before, after })
    },
    [groups, logEntry],
  )

  const deleteGroup = useCallback(
    (id: string) => {
      const before = groups.find((g) => g.id === id)
      setGroups((prev) => prev.filter((g) => g.id !== id))
      if (before) {
        logEntry({ action: 'delete', entityType: 'patient_group', entityId: id, entityLabel: before.name, before })
      }
    },
    [groups, logEntry],
  )

  return { groups, addGroup, renameGroup, deleteGroup }
}

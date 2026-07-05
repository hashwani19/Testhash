import { useCallback, useEffect, useState } from 'react'
import type { PatientGroup } from '../types'
import { SEED_GROUPS } from '../seedData'

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
  }, [groups])

  const addGroup = useCallback((name: string) => {
    const group: PatientGroup = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setGroups((prev) => [...prev, group].sort((a, b) => a.name.localeCompare(b.name)))
    return group.id
  }, [])

  const renameGroup = useCallback((id: string, name: string) => {
    setGroups((prev) =>
      prev
        .map((g) => (g.id === id ? { ...g, name: name.trim(), updatedAt: Date.now() } : g))
        .sort((a, b) => a.name.localeCompare(b.name)),
    )
  }, [])

  const deleteGroup = useCallback((id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }, [])

  return { groups, addGroup, renameGroup, deleteGroup }
}

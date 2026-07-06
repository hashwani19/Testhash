import { useCallback, useEffect, useState } from 'react'
import type { EyeVisit, Patient, RefractionGrid } from '../types'
import { isEmptyVisit } from '../utils/eyeVisit'
import { SEED_VISITS } from '../seedData'
import { useAuditLog } from './useAuditLog'

const STORAGE_KEY = 'testhash.eyeVisits.v1'

function loadVisits(): EyeVisit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as EyeVisit[]
  } catch {
    // fall through to reseed
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_VISITS))
  return SEED_VISITS
}

export interface EyeVisitInput {
  visitAt: string
  refractions: RefractionGrid
  lenses?: string
  diagnosis?: string
  treatmentPlan?: string
  followUpDate?: string
  notes?: string
}

function visitLabel(visit: Pick<EyeVisit, 'patientId' | 'visitAt'>, patients: Patient[]): string {
  const patientName = patients.find((p) => p.id === visit.patientId)?.name ?? 'Unknown patient'
  const date = new Date(visit.visitAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return `${patientName} — ${date}`
}

/** Takes the current patient list so its entries can log a human-readable
 *  label (patient name + visit date) resolved at write time, before the
 *  patient a visit belongs to might ever be deleted (§7 of docs/design.md). */
export function useEyeVisits(patients: Patient[]) {
  const [visits, setVisits] = useState<EyeVisit[]>(() => loadVisits())
  const { logEntry } = useAuditLog()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visits))
  }, [visits])

  const addVisit = useCallback(
    (patientId: string, input: EyeVisitInput) => {
      // A visit date alone isn't a record — require at least one real value.
      if (
        isEmptyVisit(input.refractions, [
          input.lenses,
          input.diagnosis,
          input.treatmentPlan,
          input.followUpDate,
          input.notes,
        ])
      ) {
        return false
      }
      const now = Date.now()
      const visit: EyeVisit = {
        id: crypto.randomUUID(),
        patientId,
        visitAt: input.visitAt,
        refractions: input.refractions,
        lenses: input.lenses?.trim() || undefined,
        diagnosis: input.diagnosis?.trim() || undefined,
        treatmentPlan: input.treatmentPlan?.trim() || undefined,
        followUpDate: input.followUpDate || undefined,
        notes: input.notes?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }
      setVisits((prev) => [visit, ...prev])
      logEntry({
        action: 'create',
        entityType: 'eye_visit',
        entityId: visit.id,
        entityLabel: visitLabel(visit, patients),
        after: visit,
      })
      return true
    },
    [logEntry, patients],
  )

  const updateVisit = useCallback(
    (id: string, input: EyeVisitInput) => {
      // Same rule as create — editing everything away shouldn't leave an empty record behind.
      if (
        isEmptyVisit(input.refractions, [
          input.lenses,
          input.diagnosis,
          input.treatmentPlan,
          input.followUpDate,
          input.notes,
        ])
      ) {
        return false
      }
      const before = visits.find((v) => v.id === id)
      if (!before) return false
      const after: EyeVisit = {
        ...before,
        visitAt: input.visitAt,
        refractions: input.refractions,
        lenses: input.lenses?.trim() || undefined,
        diagnosis: input.diagnosis?.trim() || undefined,
        treatmentPlan: input.treatmentPlan?.trim() || undefined,
        followUpDate: input.followUpDate || undefined,
        notes: input.notes?.trim() || undefined,
        updatedAt: Date.now(),
      }
      setVisits((prev) => prev.map((v) => (v.id === id ? after : v)))
      logEntry({
        action: 'update',
        entityType: 'eye_visit',
        entityId: id,
        entityLabel: visitLabel(after, patients),
        before,
        after,
      })
      return true
    },
    [visits, logEntry, patients],
  )

  const deleteVisit = useCallback(
    (id: string) => {
      const before = visits.find((v) => v.id === id)
      setVisits((prev) => prev.filter((v) => v.id !== id))
      if (before) {
        logEntry({
          action: 'delete',
          entityType: 'eye_visit',
          entityId: id,
          entityLabel: visitLabel(before, patients),
          before,
        })
      }
    },
    [visits, logEntry, patients],
  )

  const deleteVisitsForPatient = useCallback(
    (patientId: string) => {
      const toDelete = visits.filter((v) => v.patientId === patientId)
      setVisits((prev) => prev.filter((v) => v.patientId !== patientId))
      for (const visit of toDelete) {
        logEntry({
          action: 'delete',
          entityType: 'eye_visit',
          entityId: visit.id,
          entityLabel: visitLabel(visit, patients),
          before: visit,
        })
      }
    },
    [visits, logEntry, patients],
  )

  const getVisitsForPatient = useCallback(
    (patientId: string) =>
      visits
        .filter((v) => v.patientId === patientId)
        .sort((a, b) => b.visitAt.localeCompare(a.visitAt) || b.createdAt - a.createdAt),
    [visits],
  )

  return { visits, addVisit, updateVisit, deleteVisit, deleteVisitsForPatient, getVisitsForPatient }
}

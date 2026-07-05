import { useCallback, useEffect, useState } from 'react'
import type { EyeVisit, RefractionGrid } from '../types'
import { isEmptyVisit } from '../utils/eyeVisit'

const STORAGE_KEY = 'testhash.eyeVisits.v1'

function loadVisits(): EyeVisit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as EyeVisit[]) : []
  } catch {
    return []
  }
}

export interface EyeVisitInput {
  visitAt: string
  refractions: RefractionGrid
  lenses?: string
  diagnosis?: string
  treatmentPlan?: string
  notes?: string
}

export function useEyeVisits() {
  const [visits, setVisits] = useState<EyeVisit[]>(() => loadVisits())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visits))
  }, [visits])

  const addVisit = useCallback((patientId: string, input: EyeVisitInput) => {
    // A visit date alone isn't a record — require at least one real value.
    if (isEmptyVisit(input.refractions, [input.lenses, input.diagnosis, input.treatmentPlan, input.notes])) {
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
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }
    setVisits((prev) => [visit, ...prev])
    return true
  }, [])

  const updateVisit = useCallback((id: string, input: EyeVisitInput) => {
    // Same rule as create — editing everything away shouldn't leave an empty record behind.
    if (isEmptyVisit(input.refractions, [input.lenses, input.diagnosis, input.treatmentPlan, input.notes])) {
      return false
    }
    setVisits((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              visitAt: input.visitAt,
              refractions: input.refractions,
              lenses: input.lenses?.trim() || undefined,
              diagnosis: input.diagnosis?.trim() || undefined,
              treatmentPlan: input.treatmentPlan?.trim() || undefined,
              notes: input.notes?.trim() || undefined,
              updatedAt: Date.now(),
            }
          : v,
      ),
    )
    return true
  }, [])

  const deleteVisit = useCallback((id: string) => {
    setVisits((prev) => prev.filter((v) => v.id !== id))
  }, [])

  const deleteVisitsForPatient = useCallback((patientId: string) => {
    setVisits((prev) => prev.filter((v) => v.patientId !== patientId))
  }, [])

  const getVisitsForPatient = useCallback(
    (patientId: string) =>
      visits
        .filter((v) => v.patientId === patientId)
        .sort((a, b) => b.visitAt.localeCompare(a.visitAt) || b.createdAt - a.createdAt),
    [visits],
  )

  return { visits, addVisit, updateVisit, deleteVisit, deleteVisitsForPatient, getVisitsForPatient }
}

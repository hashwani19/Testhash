import { useCallback, useEffect, useState } from 'react'
import type { Gender, Patient } from '../types'

const STORAGE_KEY = 'testhash.patients.v1'

function loadPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Patient[]) : []
  } catch {
    return []
  }
}

export interface PatientInput {
  name: string
  dob?: string
  manualAge?: number
  address?: string
  gender: Gender
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>(() => loadPatients())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
  }, [patients])

  const addPatient = useCallback((input: PatientInput) => {
    const patient: Patient = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      dob: input.dob || undefined,
      manualAge: input.dob ? undefined : input.manualAge,
      address: input.address?.trim() || undefined,
      gender: input.gender,
      createdAt: Date.now(),
    }
    setPatients((prev) => [patient, ...prev])
    return patient.id
  }, [])

  const updatePatient = useCallback((id: string, input: PatientInput) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: input.name.trim(),
              dob: input.dob || undefined,
              manualAge: input.dob ? undefined : input.manualAge,
              address: input.address?.trim() || undefined,
              gender: input.gender,
            }
          : p,
      ),
    )
  }, [])

  const deletePatient = useCallback((id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { patients, addPatient, updatePatient, deletePatient }
}

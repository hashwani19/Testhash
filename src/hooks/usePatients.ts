import { useCallback, useEffect, useState } from 'react'
import type { Gender, Patient } from '../types'
import { generatePatientNumber } from '../utils/patientNumber'
import { SEED_PATIENTS } from '../seedData'

const STORAGE_KEY = 'testhash.patients.v1'

function loadPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Patient[]
  } catch {
    // fall through to reseed
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PATIENTS))
  return SEED_PATIENTS
}

export interface PatientInput {
  name: string
  dob?: string
  manualAge?: number
  address?: string
  gender: Gender
  groupId?: string
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>(() => loadPatients())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
  }, [patients])

  const addPatient = useCallback((input: PatientInput) => {
    const now = Date.now()
    const patient: Patient = {
      id: crypto.randomUUID(),
      patientNumber: generatePatientNumber(),
      name: input.name.trim(),
      dob: input.dob || undefined,
      manualAge: input.dob ? undefined : input.manualAge,
      address: input.address?.trim() || undefined,
      gender: input.gender,
      groupId: input.groupId || undefined,
      createdAt: now,
      updatedAt: now,
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
              groupId: input.groupId || undefined,
              updatedAt: Date.now(),
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

import { useCallback } from 'react'
import type { Gender, Patient } from '../types'
import { generatePatientNumber } from '../utils/patientNumber'
import { sanitizeText } from '../utils/sanitize'
import { DEFAULT_TENANT_ID, useTenantStorageState } from '../utils/tenantStorage'
import { SEED_PATIENTS } from '../seedData'
import { useAuditLog } from './useAuditLog'

const BASE_STORAGE_KEY = 'testhash.patients.v1'

function loadPatients(storageKey: string, tenantId: string): Patient[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw) as Patient[]
  } catch {
    // fall through to reseed
  }
  const seed = tenantId === DEFAULT_TENANT_ID ? SEED_PATIENTS : []
  localStorage.setItem(storageKey, JSON.stringify(seed))
  return seed
}

export interface PatientInput {
  name: string
  dob?: string
  manualAge?: number
  address?: string
  mobile?: string
  gender: Gender
  groupId?: string
}

export function usePatients() {
  const [patients, setPatients] = useTenantStorageState<Patient[]>(BASE_STORAGE_KEY, loadPatients)
  const { logEntry } = useAuditLog()

  const addPatient = useCallback(
    (input: PatientInput) => {
      const now = Date.now()
      const patient: Patient = {
        id: crypto.randomUUID(),
        patientNumber: generatePatientNumber(),
        name: sanitizeText(input.name),
        dob: input.dob || undefined,
        // The form itself decides whether this is a genuine override (only
        // sending a value when it diverges from the dob-computed age) — the
        // hook just persists whatever it's given (§ getPatientAge).
        manualAge: input.manualAge,
        address: input.address ? sanitizeText(input.address) || undefined : undefined,
        mobile: input.mobile ? sanitizeText(input.mobile) || undefined : undefined,
        gender: input.gender,
        groupId: input.groupId || undefined,
        createdAt: now,
        updatedAt: now,
      }
      setPatients((prev) => [patient, ...prev])
      logEntry({ action: 'create', entityType: 'patient', entityId: patient.id, entityLabel: patient.name, after: patient })
      return patient.id
    },
    [logEntry, setPatients],
  )

  const updatePatient = useCallback(
    (id: string, input: PatientInput) => {
      const before = patients.find((p) => p.id === id)
      if (!before) return
      const after: Patient = {
        ...before,
        name: sanitizeText(input.name),
        dob: input.dob || undefined,
        // The form itself decides whether this is a genuine override (only
        // sending a value when it diverges from the dob-computed age) — the
        // hook just persists whatever it's given (§ getPatientAge).
        manualAge: input.manualAge,
        address: input.address ? sanitizeText(input.address) || undefined : undefined,
        mobile: input.mobile ? sanitizeText(input.mobile) || undefined : undefined,
        gender: input.gender,
        groupId: input.groupId || undefined,
        updatedAt: Date.now(),
      }
      setPatients((prev) => prev.map((p) => (p.id === id ? after : p)))
      logEntry({ action: 'update', entityType: 'patient', entityId: id, entityLabel: after.name, before, after })
    },
    [patients, logEntry, setPatients],
  )

  const deletePatient = useCallback(
    (id: string) => {
      const before = patients.find((p) => p.id === id)
      setPatients((prev) => prev.filter((p) => p.id !== id))
      if (before) {
        logEntry({ action: 'delete', entityType: 'patient', entityId: id, entityLabel: before.name, before })
      }
    },
    [patients, logEntry, setPatients],
  )

  return { patients, addPatient, updatePatient, deletePatient }
}

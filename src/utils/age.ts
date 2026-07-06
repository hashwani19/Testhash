import type { Patient } from '../types'

export function computeAgeFromDob(dob: string, atDate: Date = new Date()): number {
  const birth = new Date(dob)
  let age = atDate.getFullYear() - birth.getFullYear()
  const monthDiff = atDate.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && atDate.getDate() < birth.getDate())) {
    age--
  }
  return Math.max(age, 0)
}

export function getPatientAge(patient: Pick<Patient, 'dob' | 'manualAge'>): number | undefined {
  // manualAge is only ever stored alongside a dob when it's a deliberate
  // override (see PatientForm) — otherwise it's cleared so the age keeps
  // recomputing from dob (and so stays correct as birthdays pass) instead of
  // freezing at whatever it happened to be when last saved.
  if (patient.manualAge != null) return patient.manualAge
  if (patient.dob) return computeAgeFromDob(patient.dob)
  return undefined
}

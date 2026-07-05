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
  if (patient.dob) return computeAgeFromDob(patient.dob)
  return patient.manualAge
}

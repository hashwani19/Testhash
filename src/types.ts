export type Gender = 'female' | 'male' | 'other' | 'unspecified'

export interface Patient {
  id: string
  name: string
  /** ISO date string (YYYY-MM-DD). When present, age is derived from this instead of manualAge. */
  dob?: string
  /** Used only when dob is not provided. */
  manualAge?: number
  address?: string
  gender: Gender
  createdAt: number
}

export interface EyeValues {
  sphere: number
  cylinder: number
  distance: number
}

export interface EyeRecord {
  id: string
  patientId: string
  /** ISO date string (YYYY-MM-DD) — the visit/exam date. */
  date: string
  left: EyeValues
  right: EyeValues
  notes?: string
  createdAt: number
}

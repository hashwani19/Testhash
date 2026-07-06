export type Gender = 'female' | 'male' | 'other' | 'unspecified'

export type Role = 'admin' | 'doctor' | 'front_desk'

export type ThemePreference = 'light' | 'dark' | 'auto'

export interface UserPreferences {
  theme: ThemePreference
  /** Items per page in list views. Undefined means "use the list's own default (20)". */
  listPageSize?: number
}

export interface User {
  id: string
  email: string
  /** Plaintext for this local-only test build — never do this against a real backend. */
  password: string
  fullName: string
  role: Role
  createdAt: number
}

export interface PatientGroup {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface Patient {
  id: string
  /** Human-facing ID, e.g. "P-20260705-0007". Immutable once assigned. */
  patientNumber: string
  name: string
  /** ISO date string (YYYY-MM-DD). When present, age is derived from this instead of manualAge. */
  dob?: string
  /** Used only when dob is not provided. */
  manualAge?: number
  address?: string
  /** India mobile number, 10 digits (no country code stored). */
  mobile?: string
  gender: Gender
  groupId?: string
  createdAt: number
  updatedAt: number
}

export interface Appointment {
  id: string
  /** ISO date string (YYYY-MM-DD) — the day of the appointment. */
  date: string
  /** 24h "HH:mm" time of day. */
  time: string
  /** Set once booked against (or converted to) an existing patient. */
  patientId?: string
  /** Prospective-patient booking details — meaningful only while `patientId` is unset. */
  name?: string
  dob?: string
  manualAge?: number
  mobile?: string
  address?: string
  createdAt: number
  updatedAt: number
}

/** App-wide (not per-user) settings, admin-configurable. */
export interface GlobalSettings {
  /** Whether appointments past `autoDeleteAfterDays` old are swept on load. */
  autoDeleteOldAppointments: boolean
  autoDeleteAfterDays: number
}

export type Eye = 'left' | 'right'
export type VisionType = 'distance' | 'reading'

export interface EyeRefraction {
  sphere?: number
  cylinder?: number
  axis?: number
  visualAcuity?: string
}

/** Refraction values for one visit: up to 4 rows (left/right x distance/reading). */
export type RefractionGrid = Record<Eye, Record<VisionType, EyeRefraction>>

export interface EyeVisit {
  id: string
  patientId: string
  /** ISO datetime — date and time of the exam, not just a date. */
  visitAt: string
  refractions: RefractionGrid
  lenses?: string
  diagnosis?: string
  treatmentPlan?: string
  /** ISO date string (YYYY-MM-DD). When to bring the patient back next. */
  followUpDate?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

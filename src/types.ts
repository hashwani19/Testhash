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
  /** ISO date string (YYYY-MM-DD). Drives the default computed age; changing it
   *  recomputes the age and clears any override. */
  dob?: string
  /** Absent unless the computed-from-dob age was explicitly overridden (or
   *  there's no dob at all, in which case this is the only age there is). */
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
  /** 24h "HH:mm" time of day. Optional — a day-only booking is valid. */
  time?: string
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

export type AuditAction = 'create' | 'update' | 'delete'
export type AuditEntityType = 'patient' | 'patient_group' | 'eye_visit' | 'appointment' | 'attachment'

export interface AuditLogEntry {
  id: string
  actorUserId: string
  /** Snapshotted at write time — survives the actor's account being renamed/removed later. */
  actorName: string
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  /** Snapshotted at write time — survives the entity itself being deleted later. */
  entityLabel: string
  /** JSON snapshot of the row before the change. Unset for `create`. */
  beforeJson?: string
  /** JSON snapshot of the row after the change. Unset for `delete`. */
  afterJson?: string
  createdAt: number
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

export interface Attachment {
  id: string
  visitId: string
  fileName: string
  contentType: string
  /** Compressed image as a data URL. The real backend stores a `storage_key`
   *  pointing at an R2 object instead (§5.2/§5.3 of docs/design.md) — this
   *  local-only build has no object storage, so the compressed bytes are
   *  kept directly. */
  dataUrl: string
  sizeBytes: number
  createdAt: number
}

export type Gender = 'female' | 'male' | 'other' | 'unspecified'

/** `super_user` is platform-level (manages tenants, not scoped to one). The
 *  other three are tenant-scoped roles (§6/§8 of docs/design.md). */
export type Role = 'super_user' | 'admin' | 'doctor' | 'front_desk'

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
  /** A user can hold more than one role at once (e.g. both `admin` and
   *  `doctor`) — access is the union of every held role's permissions.
   *  Always at least one entry. */
  roles: Role[]
  /** Owning tenant. Unset only for the fixed `super_user` account, which
   *  isn't scoped to any one clinic. */
  tenantId?: string
  createdAt: number
}

/** Extensible clinic-type lookup (docs/design.md §5.5) — not a hardcoded
 *  enum in the real backend design, but a closed union is enough for this
 *  local-only build. Drives which prescription fields a tenant sees. */
export type ClinicType = 'ophthalmology' | 'orthopedic'

export type TenantStatus = 'active' | 'suspended'

/** A signed-up clinic. Doctor name/credentials/clinic address/logo live on
 *  that tenant's own `PrescriptionTemplate` (§5.6) rather than here, since
 *  they're already an existing, tenant-scoped, admin-editable settings
 *  object — this just holds the identity/status fields specific to
 *  provisioning and superuser management. */
export interface Tenant {
  id: string
  clinicType: ClinicType
  /** India mobile number, 10 digits (no country code stored) — same
   *  convention as `Patient.mobile`. */
  mobile: string
  status: TenantStatus
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
  /** Drives the default computed age; changing it recomputes the age and
   *  clears any override (§ Patient.dob). */
  dob?: string
  /** Absent unless the computed-from-dob age was explicitly overridden (or
   *  there's no dob at all, in which case this is the only age there is). */
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

/** App-wide print configuration for prescriptions (docs/design.md §5.6) —
 *  fixed layout, configurable content only, admin-configurable. */
export interface PrescriptionTemplate {
  /** If false, the printed header is left blank instead of showing the
   *  clinic name — for practices using pre-printed letterhead paper. */
  showLetterhead: boolean
  /** Extra blank space reserved at the top of the printed page, mainly
   *  meaningful alongside `showLetterhead: false`. */
  topMarginMm: number
  /** Clinic name printed in the letterhead header. Optional — an unset
   *  value falls back to the app's default clinic name at print time, so
   *  templates saved before this field existed keep printing unchanged. */
  clinicName?: string
  /** Clinic address printed under the clinic name in the header. Free
   *  text, may contain line breaks. Optional — omitted when unset. */
  clinicAddress?: string
  /** Doctor's name printed on the opposite side of the header from the
   *  clinic name/address. Optional — omitted from the header when unset. */
  doctorName?: string
  /** Doctor's credentials (e.g. "M.B.B.S., M.S., F.C.L.I."), printed under
   *  the doctor's name. Free text, may contain line breaks. Optional. */
  doctorCredentials?: string
  /** Free text printed at the bottom of every prescription. */
  footerNote?: string
  /** Compressed logo image as a data URL — prints both as a small icon next
   *  to the clinic name in the letterhead header and as a faint full-page
   *  watermark. Optional — no logo means neither. */
  logoDataUrl?: string
}

export type AuditAction = 'create' | 'update' | 'delete' | 'export'
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

import { useCallback, useEffect } from 'react'
import type { Appointment, Patient } from '../types'
import { dateOnlyDaysAgo } from '../utils/date'
import { resolveAppointmentName } from '../utils/appointmentQuery'
import { sanitizeText } from '../utils/sanitize'
import { DEFAULT_TENANT_ID, useTenantStorageState } from '../utils/tenantStorage'
import { useGlobalSettings } from './useGlobalSettings'
import { useAuditLog } from './useAuditLog'
import { SEED_APPOINTMENTS } from '../seedData'

const BASE_STORAGE_KEY = 'testhash.appointments.v1'

function loadAppointments(storageKey: string, tenantId: string): Appointment[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw) as Appointment[]
  } catch {
    // fall through to reseed
  }
  const seed = tenantId === DEFAULT_TENANT_ID ? SEED_APPOINTMENTS : []
  localStorage.setItem(storageKey, JSON.stringify(seed))
  return seed
}

export interface NewPatientAppointmentInput {
  name: string
  dob?: string
  manualAge?: number
  mobile?: string
  address?: string
}

export interface AppointmentInput {
  date: string
  time?: string
  /** Set for an existing-patient booking; omit and pass `newPatient` instead for a prospective patient. */
  patientId?: string
  newPatient?: NewPatientAppointmentInput
}

/**
 * Owns the appointments list. Every role can edit or delete (single or
 * bulk) any appointment — there's no admin-only restriction here, unlike
 * clinical record deletion (§4, §8.11). On top of manual delete, the
 * admin-configurable auto-delete sweep (§5.2, §8.11) also drops
 * appointments dated more than `autoDeleteAfterDays` in the past whenever
 * this hook (re-)mounts or the global setting changes.
 *
 * Takes the current patient list so audit log entries (§7) can resolve a
 * human-readable label (the linked patient's name, or the prospective
 * name) the same way the appointments list itself does.
 */
export function useAppointments(patients: Patient[]) {
  const [appointments, setAppointments] = useTenantStorageState<Appointment[]>(
    BASE_STORAGE_KEY,
    loadAppointments,
  )
  const { settings } = useGlobalSettings()
  const { logEntry } = useAuditLog()

  useEffect(() => {
    if (!settings.autoDeleteOldAppointments) return
    const cutoff = dateOnlyDaysAgo(settings.autoDeleteAfterDays)
    setAppointments((prev) => prev.filter((a) => a.date >= cutoff))
  }, [settings.autoDeleteOldAppointments, settings.autoDeleteAfterDays, setAppointments])

  const addAppointment = useCallback(
    (input: AppointmentInput) => {
      const now = Date.now()
      const appointment: Appointment = {
        id: crypto.randomUUID(),
        date: input.date,
        time: input.time || undefined,
        patientId: input.patientId,
        name: input.newPatient?.name ? sanitizeText(input.newPatient.name) : undefined,
        dob: input.newPatient?.dob || undefined,
        // The form itself decides whether this is a genuine override (only
        // sending a value when it diverges from the dob-computed age) — the
        // hook just persists whatever it's given (§ getPatientAge).
        manualAge: input.newPatient?.manualAge,
        mobile: input.newPatient?.mobile ? sanitizeText(input.newPatient.mobile) || undefined : undefined,
        address: input.newPatient?.address ? sanitizeText(input.newPatient.address) || undefined : undefined,
        createdAt: now,
        updatedAt: now,
      }
      setAppointments((prev) => [appointment, ...prev])
      logEntry({
        action: 'create',
        entityType: 'appointment',
        entityId: appointment.id,
        entityLabel: resolveAppointmentName(appointment, patients),
        after: appointment,
      })
    },
    [logEntry, patients, setAppointments],
  )

  /** Called once an appointment's prospective patient is actually created, so
   *  the appointment resolves through the real patient record from then on. */
  const linkAppointmentToPatient = useCallback(
    (id: string, patientId: string) => {
      const before = appointments.find((a) => a.id === id)
      if (!before) return
      const after: Appointment = { ...before, patientId, updatedAt: Date.now() }
      setAppointments((prev) => prev.map((a) => (a.id === id ? after : a)))
      logEntry({
        action: 'update',
        entityType: 'appointment',
        entityId: id,
        entityLabel: resolveAppointmentName(after, patients),
        before,
        after,
      })
    },
    [appointments, logEntry, patients, setAppointments],
  )

  const updateAppointment = useCallback(
    (id: string, input: AppointmentInput) => {
      const before = appointments.find((a) => a.id === id)
      if (!before) return
      const after: Appointment = {
        ...before,
        date: input.date,
        time: input.time || undefined,
        patientId: input.patientId,
        name: input.newPatient?.name ? sanitizeText(input.newPatient.name) : undefined,
        dob: input.newPatient?.dob || undefined,
        // The form itself decides whether this is a genuine override (only
        // sending a value when it diverges from the dob-computed age) — the
        // hook just persists whatever it's given (§ getPatientAge).
        manualAge: input.newPatient?.manualAge,
        mobile: input.newPatient?.mobile ? sanitizeText(input.newPatient.mobile) || undefined : undefined,
        address: input.newPatient?.address ? sanitizeText(input.newPatient.address) || undefined : undefined,
        updatedAt: Date.now(),
      }
      setAppointments((prev) => prev.map((a) => (a.id === id ? after : a)))
      logEntry({
        action: 'update',
        entityType: 'appointment',
        entityId: id,
        entityLabel: resolveAppointmentName(after, patients),
        before,
        after,
      })
    },
    [appointments, logEntry, patients, setAppointments],
  )

  const deleteAppointment = useCallback(
    (id: string) => {
      const before = appointments.find((a) => a.id === id)
      setAppointments((prev) => prev.filter((a) => a.id !== id))
      if (before) {
        logEntry({
          action: 'delete',
          entityType: 'appointment',
          entityId: id,
          entityLabel: resolveAppointmentName(before, patients),
          before,
        })
      }
    },
    [appointments, logEntry, patients, setAppointments],
  )

  /** Bulk delete — every role can select multiple rows and remove them in
   *  one confirm (§8.11); there's no separate "select all then delete one
   *  by one" requirement to satisfy, so this just filters by a set of ids.
   *  Still one audit log entry per deleted appointment, same granularity
   *  a real per-id DELETE /appointments/:id call would produce (§6). */
  const deleteAppointments = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      const toDelete = appointments.filter((a) => idSet.has(a.id))
      setAppointments((prev) => prev.filter((a) => !idSet.has(a.id)))
      for (const appointment of toDelete) {
        logEntry({
          action: 'delete',
          entityType: 'appointment',
          entityId: appointment.id,
          entityLabel: resolveAppointmentName(appointment, patients),
          before: appointment,
        })
      }
    },
    [appointments, logEntry, patients, setAppointments],
  )

  return {
    appointments,
    addAppointment,
    linkAppointmentToPatient,
    updateAppointment,
    deleteAppointment,
    deleteAppointments,
  }
}

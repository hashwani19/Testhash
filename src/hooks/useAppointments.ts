import { useCallback, useEffect, useState } from 'react'
import type { Appointment } from '../types'
import { dateOnlyDaysAgo } from '../utils/date'
import { useGlobalSettings } from './useGlobalSettings'
import { SEED_APPOINTMENTS } from '../seedData'

const STORAGE_KEY = 'testhash.appointments.v1'

function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Appointment[]
  } catch {
    // fall through to reseed
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPOINTMENTS))
  return SEED_APPOINTMENTS
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
 */
export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadAppointments())
  const { settings } = useGlobalSettings()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
  }, [appointments])

  useEffect(() => {
    if (!settings.autoDeleteOldAppointments) return
    const cutoff = dateOnlyDaysAgo(settings.autoDeleteAfterDays)
    setAppointments((prev) => prev.filter((a) => a.date >= cutoff))
  }, [settings.autoDeleteOldAppointments, settings.autoDeleteAfterDays])

  const addAppointment = useCallback((input: AppointmentInput) => {
    const now = Date.now()
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      date: input.date,
      time: input.time || undefined,
      patientId: input.patientId,
      name: input.newPatient?.name.trim(),
      dob: input.newPatient?.dob || undefined,
      manualAge: input.newPatient?.dob ? undefined : input.newPatient?.manualAge,
      mobile: input.newPatient?.mobile?.trim() || undefined,
      address: input.newPatient?.address?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }
    setAppointments((prev) => [appointment, ...prev])
  }, [])

  /** Called once an appointment's prospective patient is actually created, so
   *  the appointment resolves through the real patient record from then on. */
  const linkAppointmentToPatient = useCallback((id: string, patientId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, patientId, updatedAt: Date.now() } : a)),
    )
  }, [])

  const updateAppointment = useCallback((id: string, input: AppointmentInput) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              date: input.date,
              time: input.time || undefined,
              patientId: input.patientId,
              name: input.newPatient?.name.trim(),
              dob: input.newPatient?.dob || undefined,
              manualAge: input.newPatient?.dob ? undefined : input.newPatient?.manualAge,
              mobile: input.newPatient?.mobile?.trim() || undefined,
              address: input.newPatient?.address?.trim() || undefined,
              updatedAt: Date.now(),
            }
          : a,
      ),
    )
  }, [])

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  /** Bulk delete — every role can select multiple rows and remove them in
   *  one confirm (§8.11); there's no separate "select all then delete one
   *  by one" requirement to satisfy, so this just filters by a set of ids. */
  const deleteAppointments = useCallback((ids: string[]) => {
    const idSet = new Set(ids)
    setAppointments((prev) => prev.filter((a) => !idSet.has(a.id)))
  }, [])

  return {
    appointments,
    addAppointment,
    linkAppointmentToPatient,
    updateAppointment,
    deleteAppointment,
    deleteAppointments,
  }
}

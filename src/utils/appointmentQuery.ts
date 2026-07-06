import type { Appointment, Patient } from '../types'
import { MIN_SEARCH_LENGTH } from './patientQuery'

export type AppointmentSort = 'default' | 'name-asc' | 'name-desc'

export interface AppointmentQuery {
  search?: string
  from?: string
  to?: string
  sort?: AppointmentSort
}

/** The name to search/sort/display by: the linked patient's name once one
 *  exists, else the prospective name captured at booking time. */
export function resolveAppointmentName(appointment: Appointment, patients: Patient[]): string {
  if (appointment.patientId) {
    return patients.find((p) => p.id === appointment.patientId)?.name ?? 'Unknown patient'
  }
  return appointment.name ?? 'Unknown'
}

export function queryAppointments(
  appointments: Appointment[],
  patients: Patient[],
  { search, from, to, sort = 'default' }: AppointmentQuery,
): Appointment[] {
  const trimmedSearch = search?.trim() ?? ''
  const q = trimmedSearch.length >= MIN_SEARCH_LENGTH ? trimmedSearch.toLowerCase() : ''

  let result = appointments.filter((a) => {
    if (q && !resolveAppointmentName(a, patients).toLowerCase().includes(q)) return false
    if (from && a.date < from) return false
    if (to && a.date > to) return false
    return true
  })

  if (sort === 'name-asc') {
    result = [...result].sort((a, b) =>
      resolveAppointmentName(a, patients).localeCompare(resolveAppointmentName(b, patients)),
    )
  } else if (sort === 'name-desc') {
    result = [...result].sort((a, b) =>
      resolveAppointmentName(b, patients).localeCompare(resolveAppointmentName(a, patients)),
    )
  } else {
    // Soonest appointment first — date/time are both zero-padded strings,
    // so lexicographic order is chronological order. A day-only booking
    // (no time) sorts after every timed one on the same date, not before.
    const sortKey = (a: Appointment) => a.date + (a.time ?? '99:99')
    result = [...result].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
  }

  return result
}

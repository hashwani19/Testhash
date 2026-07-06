import { useMemo, useState } from 'react'
import type { Appointment, Patient } from '../types'
import { queryAppointments } from '../utils/appointmentQuery'
import type { AppointmentSort } from '../utils/appointmentQuery'

/**
 * Owns the appointments list's search/date-range/sort state and returns the
 * matching appointments — mirrors `usePatientQuery`'s seam so a later swap
 * to a server-backed `GET /appointments?search=&from=&to=&sort=` (§6) only
 * changes the body of the `useMemo` below.
 */
export function useAppointmentQuery(appointments: Appointment[], patients: Patient[]) {
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<AppointmentSort>('default')

  const results = useMemo(
    () => queryAppointments(appointments, patients, { search, from, to, sort }),
    [appointments, patients, search, from, to, sort],
  )

  const resetFilters = () => {
    setFrom('')
    setTo('')
    setSort('default')
  }

  const isFilterActive = from !== '' || to !== '' || sort !== 'default'

  return {
    search,
    setSearch,
    from,
    setFrom,
    to,
    setTo,
    sort,
    setSort,
    resetFilters,
    isFilterActive,
    results,
  }
}

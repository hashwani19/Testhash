import { useMemo, useState } from 'react'
import type { Patient, PatientGroup } from '../types'
import { queryPatients } from '../utils/patientQuery'
import type { PatientSort } from '../utils/patientQuery'

/**
 * Owns the patient list's search/group-filter/sort state and returns the
 * matching patients. This is the seam for wiring a real backend later:
 * today it computes the result in-memory via `queryPatients` against the
 * full `patients` array already held in the browser, but the returned
 * shape (search/setSearch/groupId/setGroupId/sort/setSort/resetFilters/
 * isFilterActive/results) is exactly what a server-backed version would
 * expose too — only the body of the `useMemo` below would change, to a
 * debounced `fetch('/api/patients?search=&group_id=&sort=&page=&limit=')`
 * (§6, §7 of docs/design.md) instead of a local array filter. PatientList
 * and SearchBox never touch `queryPatients` directly, so that swap
 * wouldn't require changing either of them.
 */
export function usePatientQuery(patients: Patient[], groups: PatientGroup[]) {
  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState('')
  const [sort, setSort] = useState<PatientSort>('default')

  const results = useMemo(
    () => queryPatients(patients, groups, { search, groupId, sort }),
    [patients, groups, search, groupId, sort],
  )

  const resetFilters = () => {
    setGroupId('')
    setSort('default')
  }

  const isFilterActive = groupId !== '' || sort !== 'default'

  return {
    search,
    setSearch,
    groupId,
    setGroupId,
    sort,
    setSort,
    resetFilters,
    isFilterActive,
    results,
  }
}

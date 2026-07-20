import { useMemo, useState } from 'react'
import type { Patient } from '../types'
import { queryPatients } from '../utils/patientQuery'
import type { PatientSort } from '../utils/patientQuery'

/**
 * Owns the patient list's search/sort state and returns the matching
 * patients. This is the seam for wiring a real backend later: today it
 * computes the result in-memory via `queryPatients` against the full
 * `patients` array already held in the browser, but the returned shape
 * (search/setSearch/sort/setSort/resetFilters/isFilterActive/results) is
 * exactly what a server-backed version would expose too — only the body of
 * the `useMemo` below would change, to a debounced
 * `fetch('/api/patients?search=&sort=&page=&limit=')` (§6, §7 of
 * docs/design.md) instead of a local array filter. PatientList and
 * SearchBox never touch `queryPatients` directly, so that swap wouldn't
 * require changing either of them.
 */
export function usePatientQuery(patients: Patient[]) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<PatientSort>('default')

  const results = useMemo(() => queryPatients(patients, { search, sort }), [patients, search, sort])

  const resetFilters = () => {
    setSort('default')
  }

  const isFilterActive = sort !== 'default'

  return {
    search,
    setSearch,
    sort,
    setSort,
    resetFilters,
    isFilterActive,
    results,
  }
}

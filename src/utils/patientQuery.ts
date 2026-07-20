import type { Patient } from '../types'

export const MIN_SEARCH_LENGTH = 3

export type PatientSort = 'default' | 'name-asc' | 'name-desc'

export interface PatientQuery {
  search?: string
  sort?: PatientSort
}

export function queryPatients(patients: Patient[], { search, sort = 'default' }: PatientQuery): Patient[] {
  const trimmedSearch = search?.trim() ?? ''
  const q = trimmedSearch.length >= MIN_SEARCH_LENGTH ? trimmedSearch.toLowerCase() : ''

  let result = patients.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && !p.patientNumber.toLowerCase().includes(q)) {
      return false
    }
    return true
  })

  if (sort === 'name-asc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'name-desc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name))
  } else {
    result = [...result].sort((a, b) => b.createdAt - a.createdAt)
  }

  return result
}

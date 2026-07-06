import type { Patient, PatientGroup } from '../types'

export const MIN_SEARCH_LENGTH = 3

export type PatientSort = 'default' | 'group' | 'name-asc' | 'name-desc'

export interface PatientQuery {
  search?: string
  groupId?: string
  sort?: PatientSort
}

export function queryPatients(
  patients: Patient[],
  groups: PatientGroup[],
  { search, groupId, sort = 'default' }: PatientQuery,
): Patient[] {
  const trimmedSearch = search?.trim() ?? ''
  const q = trimmedSearch.length >= MIN_SEARCH_LENGTH ? trimmedSearch.toLowerCase() : ''

  let result = patients.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && !p.patientNumber.toLowerCase().includes(q)) {
      return false
    }
    if (groupId && p.groupId !== groupId) return false
    return true
  })

  if (sort === 'group') {
    // Sort ungrouped patients ("No group") after every real group name.
    const groupName = (id?: string) => groups.find((g) => g.id === id)?.name ?? '￿'
    result = [...result].sort((a, b) => {
      const byGroup = groupName(a.groupId).localeCompare(groupName(b.groupId))
      if (byGroup !== 0) return byGroup
      return b.createdAt - a.createdAt
    })
  } else if (sort === 'name-asc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'name-desc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name))
  } else {
    result = [...result].sort((a, b) => b.createdAt - a.createdAt)
  }

  return result
}

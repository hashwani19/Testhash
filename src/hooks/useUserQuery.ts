import { useMemo, useState } from 'react'
import type { Role, User } from '../types'
import { queryUsers } from '../utils/userQuery'
import type { UserSort } from '../utils/userQuery'

/** Owns the (already tenant-scoped) users list's search/role-filter/sort
 *  state, mirroring `usePatientQuery`/`useTenantQuery` — same seam for a
 *  real `GET /users?search=&role=&sort=&page=` later without `UsersScreen`
 *  or `SearchBox` needing to change. */
export function useUserQuery(users: User[]) {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [sort, setSort] = useState<UserSort>('default')

  const results = useMemo(() => queryUsers(users, { search, role, sort }), [users, search, role, sort])

  const resetFilters = () => {
    setRole('')
    setSort('default')
  }

  const isFilterActive = role !== '' || sort !== 'default'

  return { search, setSearch, role, setRole, sort, setSort, resetFilters, isFilterActive, results }
}

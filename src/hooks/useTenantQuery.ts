import { useMemo, useState } from 'react'
import type { ClinicType, Tenant, TenantStatus, User } from '../types'
import { queryTenants } from '../utils/tenantQuery'
import type { TenantSort } from '../utils/tenantQuery'

/** Owns the tenants list's search/status-filter/clinic-type-filter/sort
 *  state, mirroring `usePatientQuery` — the same seam for swapping in a
 *  real `GET /platform/tenants?search=&status=&clinic_type=&sort=&page=`
 *  call later without TenantsScreen or SearchBox needing to change. */
export function useTenantQuery(tenants: Tenant[], users: User[]) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TenantStatus | ''>('')
  const [clinicType, setClinicType] = useState<ClinicType | ''>('')
  const [sort, setSort] = useState<TenantSort>('default')

  const results = useMemo(
    () => queryTenants(tenants, users, { search, status, clinicType, sort }),
    [tenants, users, search, status, clinicType, sort],
  )

  const resetFilters = () => {
    setStatus('')
    setClinicType('')
    setSort('default')
  }

  const isFilterActive = status !== '' || clinicType !== '' || sort !== 'default'

  return {
    search,
    setSearch,
    status,
    setStatus,
    clinicType,
    setClinicType,
    sort,
    setSort,
    resetFilters,
    isFilterActive,
    results,
  }
}

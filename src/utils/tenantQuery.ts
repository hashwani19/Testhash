import type { ClinicType, Tenant, TenantStatus, User } from '../types'

export const MIN_SEARCH_LENGTH = 3

export type TenantSort = 'default' | 'email-asc' | 'email-desc'

export interface TenantQuery {
  search?: string
  status?: TenantStatus | ''
  clinicType?: ClinicType | ''
  sort?: TenantSort
}

/** A tenant has no name of its own to search/sort/display by — its
 *  founder's email (falling back to any other admin, in case a founder
 *  somehow doesn't exist) is the closest thing, same resolution
 *  `TenantsScreen`'s "reset admin password" already uses. */
export function adminEmailFor(tenant: Tenant, users: User[]): string {
  const founder = users.find((u) => u.tenantId === tenant.id && u.isFounder)
  if (founder) return founder.email
  return users.find((u) => u.tenantId === tenant.id && u.roles.includes('admin'))?.email ?? ''
}

export function queryTenants(
  tenants: Tenant[],
  users: User[],
  { search, status, clinicType, sort = 'default' }: TenantQuery,
): Tenant[] {
  const trimmedSearch = search?.trim() ?? ''
  const q = trimmedSearch.length >= MIN_SEARCH_LENGTH ? trimmedSearch.toLowerCase() : ''

  let result = tenants.filter((t) => {
    if (q) {
      const email = adminEmailFor(t, users).toLowerCase()
      if (!email.includes(q) && !t.mobile.toLowerCase().includes(q)) return false
    }
    if (status && t.status !== status) return false
    if (clinicType && t.clinicType !== clinicType) return false
    return true
  })

  if (sort === 'email-asc') {
    result = [...result].sort((a, b) => adminEmailFor(a, users).localeCompare(adminEmailFor(b, users)))
  } else if (sort === 'email-desc') {
    result = [...result].sort((a, b) => adminEmailFor(b, users).localeCompare(adminEmailFor(a, users)))
  } else {
    result = [...result].sort((a, b) => b.createdAt - a.createdAt)
  }

  return result
}

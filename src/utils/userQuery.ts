import type { Role, User } from '../types'

export const MIN_SEARCH_LENGTH = 3

export type UserSort = 'default' | 'name-asc' | 'name-desc'

export interface UserQuery {
  search?: string
  role?: Role | ''
  sort?: UserSort
}

export function queryUsers(users: User[], { search, role, sort = 'default' }: UserQuery): User[] {
  const trimmedSearch = search?.trim() ?? ''
  const q = trimmedSearch.length >= MIN_SEARCH_LENGTH ? trimmedSearch.toLowerCase() : ''

  let result = users.filter((u) => {
    if (q && !u.fullName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
    if (role && !u.roles.includes(role)) return false
    return true
  })

  if (sort === 'name-asc') {
    result = [...result].sort((a, b) => a.fullName.localeCompare(b.fullName))
  } else if (sort === 'name-desc') {
    result = [...result].sort((a, b) => b.fullName.localeCompare(a.fullName))
  } else {
    result = [...result].sort((a, b) => b.createdAt - a.createdAt)
  }

  return result
}

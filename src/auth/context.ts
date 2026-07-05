import { createContext } from 'react'
import type { Role, User } from '../types'

export interface AuthContextValue {
  user: User | null
  users: User[]
  login: (email: string, password: string) => boolean
  logout: () => void
  createUser: (input: { email: string; password: string; fullName: string; role: Role }) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

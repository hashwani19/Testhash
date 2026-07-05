import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Role, User } from '../types'
import { AuthContext } from './context'

const USERS_KEY = 'testhash.users.v1'
const SESSION_KEY = 'testhash.session.v1'

const SEED_USERS: User[] = [
  {
    id: 'seed-admin',
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'Alex Admin',
    role: 'admin',
    createdAt: Date.now(),
  },
  {
    id: 'seed-doctor',
    email: 'doctor@example.com',
    password: 'doctor123',
    fullName: 'Dr. Dana Doctor',
    role: 'doctor',
    createdAt: Date.now(),
  },
  {
    id: 'seed-frontdesk',
    email: 'frontdesk@example.com',
    password: 'frontdesk123',
    fullName: 'Frankie Frontdesk',
    role: 'front_desk',
    createdAt: Date.now(),
  },
]

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) return JSON.parse(raw) as User[]
  } catch {
    // fall through to reseed
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS))
  return SEED_USERS
}

function loadSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadUsers())
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => loadSessionUserId())

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (sessionUserId) localStorage.setItem(SESSION_KEY, sessionUserId)
    else localStorage.removeItem(SESSION_KEY)
  }, [sessionUserId])

  const login = useCallback(
    (email: string, password: string) => {
      const match = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      )
      if (!match) return false
      setSessionUserId(match.id)
      return true
    },
    [users],
  )

  const logout = useCallback(() => setSessionUserId(null), [])

  const createUser = useCallback(
    (input: { email: string; password: string; fullName: string; role: Role }) => {
      const newUser: User = {
        id: crypto.randomUUID(),
        email: input.email.trim(),
        password: input.password,
        fullName: input.fullName.trim(),
        role: input.role,
        createdAt: Date.now(),
      }
      setUsers((prev) => [...prev, newUser])
    },
    [],
  )

  const user = users.find((u) => u.id === sessionUserId) ?? null

  return (
    <AuthContext.Provider value={{ user, users, login, logout, createUser }}>
      {children}
    </AuthContext.Provider>
  )
}

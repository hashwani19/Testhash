import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserPreferences } from '../types'
import { useAuth } from '../hooks/useAuth'
import { PreferencesContext } from './context'

const STORAGE_KEY = 'testhash.preferences.v1'

const DEFAULT_PREFERENCES: UserPreferences = { theme: 'auto' }

type PreferencesMap = Record<string, UserPreferences>

function loadAll(): PreferencesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PreferencesMap
  } catch {
    // fall through to an empty map — every user just reads as DEFAULT_PREFERENCES
  }
  return {}
}

/**
 * Per-user preferences (theme, list page size). Keyed by user id rather than
 * folded into the User record itself, since these are personal settings, not
 * account data — mirrors how a real backend would expose them via a
 * separate `/me/preferences` resource (docs/design.md §5, §6) rather than
 * bloating the user object.
 *
 * Held in context (like AuthProvider) rather than a plain hook, since a
 * plain `useState`-per-call hook would give every consumer (App, PatientList,
 * PreferencesScreen, ...) its own disconnected copy — a change made in one
 * wouldn't be seen by the others until a remount. This is the seam for
 * wiring a real API later: today `updatePreferences` writes straight to
 * localStorage, but the returned shape (`preferences`, `updatePreferences`)
 * is exactly what a `GET`/`PATCH /me/preferences`-backed version would
 * expose too — consumers wouldn't need to change.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [all, setAll] = useState<PreferencesMap>(() => loadAll())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  }, [all])

  const preferences: UserPreferences = (user ? all[user.id] : undefined) ?? DEFAULT_PREFERENCES

  const updatePreferences = useCallback(
    (patch: Partial<UserPreferences>) => {
      if (!user) return
      setAll((prev) => ({
        ...prev,
        [user.id]: { ...DEFAULT_PREFERENCES, ...prev[user.id], ...patch },
      }))
    },
    [user],
  )

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  )
}

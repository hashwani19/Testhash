import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { GlobalSettings } from '../types'
import { GlobalSettingsContext } from './context'

const STORAGE_KEY = 'testhash.settings.v1'

const DEFAULT_SETTINGS: GlobalSettings = {
  autoDeleteOldAppointments: true,
  autoDeleteAfterDays: 2,
}

function loadSettings(): GlobalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GlobalSettings>) }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_SETTINGS
}

/**
 * App-wide settings — today, just the appointment auto-delete rule (§5.2,
 * §8.11 of docs/design.md) — admin-configurable and shared by every user.
 * Unlike PreferencesProvider this isn't keyed by user id: it's one
 * instance-wide value, not a personal setting. Held in context for the same
 * reason PreferencesProvider is: every consumer (the admin toggle in
 * PreferencesScreen, the appointments auto-delete sweep) must observe the
 * same live value rather than its own disconnected copy.
 */
export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(() => loadSettings())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const updateSettings = useCallback((patch: Partial<GlobalSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return (
    <GlobalSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </GlobalSettingsContext.Provider>
  )
}

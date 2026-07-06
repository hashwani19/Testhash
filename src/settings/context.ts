import { createContext } from 'react'
import type { GlobalSettings } from '../types'

export interface GlobalSettingsContextValue {
  settings: GlobalSettings
  updateSettings: (patch: Partial<GlobalSettings>) => void
}

export const GlobalSettingsContext = createContext<GlobalSettingsContextValue | null>(null)

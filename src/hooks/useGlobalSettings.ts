import { useContext } from 'react'
import { GlobalSettingsContext } from '../settings/context'

export function useGlobalSettings() {
  const ctx = useContext(GlobalSettingsContext)
  if (!ctx) throw new Error('useGlobalSettings must be used within GlobalSettingsProvider')
  return ctx
}

import { useEffect } from 'react'
import type { ThemePreference } from '../types'

/**
 * Applies a theme preference to the document. 'auto' does nothing — it
 * removes any override and lets index.css's existing
 * `@media (prefers-color-scheme: dark)` rule keep working exactly as it
 * did before preferences existed (including live-updating if the OS theme
 * changes while the app is open, which the browser already handles for a
 * media query with zero JS). 'light'/'dark' set a `data-theme` attribute
 * that index.css gives higher specificity than the media query, so it wins
 * regardless of the OS setting.
 */
export function useThemeEffect(theme: ThemePreference) {
  useEffect(() => {
    if (theme === 'auto') {
      delete document.documentElement.dataset.theme
    } else {
      document.documentElement.dataset.theme = theme
    }
  }, [theme])
}

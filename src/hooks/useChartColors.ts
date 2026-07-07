import { useEffect, useState } from 'react'

const CHART_COLOR_VARS = ['--accent', '--chart-1', '--chart-2', '--chart-3', '--chart-4'] as const
type ChartColorVar = (typeof CHART_COLOR_VARS)[number]
export type ChartColors = Record<ChartColorVar, string>

function readChartColors(): ChartColors {
  const styles = getComputedStyle(document.documentElement)
  return Object.fromEntries(CHART_COLOR_VARS.map((v) => [v, styles.getPropertyValue(v).trim()])) as ChartColors
}

/**
 * Resolves the app's chart CSS custom properties (docs/design.md §5.7) to
 * concrete color strings, re-resolved on every theme change — OS-level
 * (`prefers-color-scheme`, covers 'auto' mode) or explicit (the
 * `data-theme` attribute `useThemeEffect` sets for 'light'/'dark' mode).
 *
 * Every other themed value in the app (backgrounds, text, borders) is a
 * plain CSS property and repaints live on its own when a var() it
 * references changes — that's the whole point of index.css's runtime
 * tokens. Recharts' bar fills don't: they're set via a plain SVG `fill`
 * attribute string (`fill="var(--accent)"`), and verified empirically that
 * while the underlying CSS variable does update, an already-painted bar
 * doesn't get invalidated for it — so a live OS theme flip while an
 * Analytics chart is on screen leaves every bar black (SVG's fallback for
 * an unresolvable presentation-attribute value) until something else
 * forces a repaint. Resolving to a concrete value here and re-rendering
 * through React state, instead of leaning on the browser to repaint an SVG
 * attribute live, sidesteps that.
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState(readChartColors)

  useEffect(() => {
    const update = () => setColors(readChartColors())
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', update)
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      mediaQuery.removeEventListener('change', update)
      observer.disconnect()
    }
  }, [])

  return colors
}

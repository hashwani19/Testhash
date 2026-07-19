import type { ClinicType } from './types'

/** Lives outside any component file so exporting it doesn't break Fast
 *  Refresh, same convention as `nav.ts`'s `NAV_ITEMS`. Only `ophthalmology`
 *  has clinic-specific prescription fields designed today (docs/design.md
 *  §5.6) — `orthopedic` is provisionable but its clinical fields are a
 *  documented follow-up (§13). */
export const CLINIC_TYPE_OPTIONS: Array<{ value: ClinicType; label: string }> = [
  { value: 'ophthalmology', label: 'Ophthalmology (eye care)' },
  { value: 'orthopedic', label: 'Orthopedic' },
]

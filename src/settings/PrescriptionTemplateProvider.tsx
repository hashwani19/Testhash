import { useCallback } from 'react'
import type { ReactNode } from 'react'
import type { PrescriptionTemplate } from '../types'
import { sanitizeText } from '../utils/sanitize'
import { useTenantStorageState } from '../utils/tenantStorage'
import { PrescriptionTemplateContext } from './prescriptionTemplateContext'

const BASE_STORAGE_KEY = 'testhash.prescriptionTemplate.v1'

// clinicName is mandatory going forward (signup/tenant-provisioning/
// Preferences all enforce it), but a stored template from before that was
// true — the pre-existing default tenant's, most notably — may still lack
// the key entirely (JSON.stringify drops undefined-valued keys, so it was
// never possible to persist an *empty* one). This default only ever
// surfaces for that legacy case; every new tenant gets a real value
// written at creation time (AuthContext.seedPrescriptionTemplate).
const DEFAULT_TEMPLATE: PrescriptionTemplate = {
  showLetterhead: true,
  topMarginMm: 0,
  clinicName: 'Ortho and Vision Care',
}

// The only free-text fields — logoDataUrl is a data: URL, not typed text,
// and must never run through sanitizeText (it would be a no-op today since
// base64 has no control characters, but the field isn't user-typed text to
// begin with).
const TEXT_FIELDS = ['clinicName', 'clinicAddress', 'doctorName', 'doctorCredentials', 'footerNote'] as const

function loadTemplate(storageKey: string): PrescriptionTemplate {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return { ...DEFAULT_TEMPLATE, ...(JSON.parse(raw) as Partial<PrescriptionTemplate>) }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_TEMPLATE
}

/**
 * App-wide print configuration for prescriptions (docs/design.md §5.6) —
 * fixed layout, admin-configurable content only (letterhead toggle, top
 * margin, footer note). Same shape as GlobalSettingsProvider: one
 * instance-wide value, held in context so the Preferences screen's admin
 * section and the print view always observe the same live value.
 */
export function PrescriptionTemplateProvider({ children }: { children: ReactNode }) {
  const [template, setTemplate] = useTenantStorageState<PrescriptionTemplate>(BASE_STORAGE_KEY, loadTemplate)

  const updateTemplate = useCallback(
    (patch: Partial<PrescriptionTemplate>) => {
      const sanitized = { ...patch }
      for (const field of TEXT_FIELDS) {
        const value = sanitized[field]
        if (value != null) sanitized[field] = sanitizeText(value) || undefined
      }
      setTemplate((prev) => ({ ...prev, ...sanitized }))
    },
    [setTemplate],
  )

  return (
    <PrescriptionTemplateContext.Provider value={{ template, updateTemplate }}>
      {children}
    </PrescriptionTemplateContext.Provider>
  )
}

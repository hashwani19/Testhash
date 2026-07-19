import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { PrescriptionTemplate } from '../types'
import { sanitizeText } from '../utils/sanitize'
import { PrescriptionTemplateContext } from './prescriptionTemplateContext'

const STORAGE_KEY = 'testhash.prescriptionTemplate.v1'

const DEFAULT_TEMPLATE: PrescriptionTemplate = {
  showLetterhead: true,
  topMarginMm: 0,
}

// The only free-text fields — logoDataUrl is a data: URL, not typed text,
// and must never run through sanitizeText (it would be a no-op today since
// base64 has no control characters, but the field isn't user-typed text to
// begin with).
const TEXT_FIELDS = ['clinicName', 'clinicAddress', 'doctorName', 'doctorCredentials', 'footerNote'] as const

function loadTemplate(): PrescriptionTemplate {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
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
  const [template, setTemplate] = useState<PrescriptionTemplate>(() => loadTemplate())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(template))
  }, [template])

  const updateTemplate = useCallback((patch: Partial<PrescriptionTemplate>) => {
    const sanitized = { ...patch }
    for (const field of TEXT_FIELDS) {
      const value = sanitized[field]
      if (value != null) sanitized[field] = sanitizeText(value) || undefined
    }
    setTemplate((prev) => ({ ...prev, ...sanitized }))
  }, [])

  return (
    <PrescriptionTemplateContext.Provider value={{ template, updateTemplate }}>
      {children}
    </PrescriptionTemplateContext.Provider>
  )
}

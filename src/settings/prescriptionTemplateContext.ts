import { createContext } from 'react'
import type { PrescriptionTemplate } from '../types'

export interface PrescriptionTemplateContextValue {
  template: PrescriptionTemplate
  updateTemplate: (patch: Partial<PrescriptionTemplate>) => void
}

export const PrescriptionTemplateContext = createContext<PrescriptionTemplateContextValue | null>(null)

import { useContext } from 'react'
import { PrescriptionTemplateContext } from '../settings/prescriptionTemplateContext'

export function usePrescriptionTemplate() {
  const ctx = useContext(PrescriptionTemplateContext)
  if (!ctx) throw new Error('usePrescriptionTemplate must be used within PrescriptionTemplateProvider')
  return ctx
}

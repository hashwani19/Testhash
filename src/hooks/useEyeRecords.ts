import { useCallback, useEffect, useState } from 'react'
import type { EyeRecord, EyeValues } from '../types'

const STORAGE_KEY = 'testhash.eyerecords.v1'

function loadRecords(): EyeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as EyeRecord[]) : []
  } catch {
    return []
  }
}

export interface EyeRecordInput {
  date: string
  left: EyeValues
  right: EyeValues
  notes?: string
}

export function useEyeRecords() {
  const [records, setRecords] = useState<EyeRecord[]>(() => loadRecords())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [records])

  const addRecord = useCallback((patientId: string, input: EyeRecordInput) => {
    const record: EyeRecord = {
      id: crypto.randomUUID(),
      patientId,
      date: input.date,
      left: input.left,
      right: input.right,
      notes: input.notes?.trim() || undefined,
      createdAt: Date.now(),
    }
    setRecords((prev) => [record, ...prev])
  }, [])

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const deleteRecordsForPatient = useCallback((patientId: string) => {
    setRecords((prev) => prev.filter((r) => r.patientId !== patientId))
  }, [])

  const getRecordsForPatient = useCallback(
    (patientId: string) =>
      records
        .filter((r) => r.patientId === patientId)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    [records],
  )

  return { records, addRecord, deleteRecord, deleteRecordsForPatient, getRecordsForPatient }
}

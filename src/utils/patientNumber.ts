const COUNTER_KEY = 'testhash.patientNumberCounters.v1'

function loadCounters(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COUNTER_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

/** Generates a monotonically increasing, date-seeded patient ID: P-YYYYMMDD-NNNN. */
export function generatePatientNumber(date: Date = new Date()): string {
  const key = dateKey(date)
  const counters = loadCounters()
  const next = (counters[key] ?? 0) + 1
  counters[key] = next
  localStorage.setItem(COUNTER_KEY, JSON.stringify(counters))
  return `P-${key}-${String(next).padStart(4, '0')}`
}

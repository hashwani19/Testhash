import type { EyeVisit, Gender, Patient } from '../types'
import { getPatientAge } from './age'
import { dateOnlyDaysAgo, dateOnlyFromTimestamp, monthKeyFromTimestamp, monthKeyMonthsAgo } from './date'

export type Granularity = 'day' | 'month'

const DAY_WINDOW = 30
const MONTH_WINDOW = 12

export interface PeriodBucket {
  key: string
  label: string
}

function dayLabel(dateOnly: string): string {
  const [y, m, d] = dateOnly.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
}

// Oldest-to-newest bucket list for the chosen granularity's fixed lookback
// window (last 30 days, or last 12 months) — built once so every metric
// below zero-fills against the same periods, rather than only showing bars
// for periods that happen to have data.
function buildBuckets(granularity: Granularity): PeriodBucket[] {
  if (granularity === 'day') {
    return Array.from({ length: DAY_WINDOW }, (_, i) => {
      const key = dateOnlyDaysAgo(DAY_WINDOW - 1 - i)
      return { key, label: dayLabel(key) }
    })
  }
  return Array.from({ length: MONTH_WINDOW }, (_, i) => {
    const key = monthKeyMonthsAgo(MONTH_WINDOW - 1 - i)
    return { key, label: monthLabel(key) }
  })
}

function bucketKeyForTimestamp(ms: number, granularity: Granularity): string {
  return granularity === 'day' ? dateOnlyFromTimestamp(ms) : monthKeyFromTimestamp(ms)
}

export interface NewPatientsBucket extends PeriodBucket {
  count: number
}

export function newPatientsByPeriod(patients: Patient[], granularity: Granularity): NewPatientsBucket[] {
  const buckets = buildBuckets(granularity)
  const counts = new Map(buckets.map((b) => [b.key, 0]))
  for (const p of patients) {
    const key = bucketKeyForTimestamp(p.createdAt, granularity)
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return buckets.map((b) => ({ ...b, count: counts.get(b.key) ?? 0 }))
}

export interface VisitsBucket extends PeriodBucket {
  newCount: number
  returningCount: number
}

export function visitsByPeriodSplitNewReturning(visits: EyeVisit[], granularity: Granularity): VisitsBucket[] {
  const buckets = buildBuckets(granularity)
  const newCounts = new Map(buckets.map((b) => [b.key, 0]))
  const returningCounts = new Map(buckets.map((b) => [b.key, 0]))

  // A visit counts as "new" if it's the earliest visit on record for its
  // patient — every later one, even outside the current lookback window, is
  // "returning". Sorted once so ties (same-day duplicate entries) resolve
  // consistently by createdAt.
  const earliestVisitId = new Map<string, string>()
  for (const v of [...visits].sort((a, b) => a.visitAt.localeCompare(b.visitAt) || a.createdAt - b.createdAt)) {
    if (!earliestVisitId.has(v.patientId)) earliestVisitId.set(v.patientId, v.id)
  }

  for (const v of visits) {
    const key = bucketKeyForTimestamp(new Date(v.visitAt).getTime(), granularity)
    if (!newCounts.has(key)) continue
    const counts = earliestVisitId.get(v.patientId) === v.id ? newCounts : returningCounts
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return buckets.map((b) => ({
    ...b,
    newCount: newCounts.get(b.key) ?? 0,
    returningCount: returningCounts.get(b.key) ?? 0,
  }))
}

export interface GenderCount {
  gender: Gender
  label: string
  count: number
}

const GENDER_LABELS: Record<Gender, string> = {
  female: 'Female',
  male: 'Male',
  other: 'Other',
  unspecified: 'Unspecified',
}

// Fixed order, not sorted by count — a gender's chart color must never shift
// as the underlying counts change, same principle as the chart-1..4 tokens
// themselves being a fixed hue order rather than reassigned per dataset.
const GENDER_ORDER: Gender[] = ['female', 'male', 'other', 'unspecified']

export function genderDistribution(patients: Patient[]): GenderCount[] {
  const counts = new Map<Gender, number>()
  for (const p of patients) counts.set(p.gender, (counts.get(p.gender) ?? 0) + 1)
  return GENDER_ORDER.map((gender) => ({ gender, label: GENDER_LABELS[gender], count: counts.get(gender) ?? 0 }))
}

export interface AgeBucket {
  label: string
  count: number
}

const AGE_BUCKET_SIZE = 10
const AGE_BUCKET_MAX_START = 90 // everyone 90+ folds into one final "90+" bucket

export function ageDistribution(patients: Patient[]): AgeBucket[] {
  const counts = new Map<number, number>()
  for (const p of patients) {
    const age = getPatientAge(p)
    if (age == null) continue
    const start = Math.min(Math.floor(age / AGE_BUCKET_SIZE) * AGE_BUCKET_SIZE, AGE_BUCKET_MAX_START)
    counts.set(start, (counts.get(start) ?? 0) + 1)
  }
  const highestStart = Math.max(AGE_BUCKET_MAX_START, ...counts.keys())
  const buckets: AgeBucket[] = []
  for (let start = 0; start <= highestStart; start += AGE_BUCKET_SIZE) {
    const label =
      start >= AGE_BUCKET_MAX_START ? `${AGE_BUCKET_MAX_START}+` : `${start}–${start + AGE_BUCKET_SIZE - 1}`
    buckets.push({ label, count: counts.get(start) ?? 0 })
  }
  return buckets
}

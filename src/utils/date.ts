function toDateOnly(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Today's date as YYYY-MM-DD in local time (not UTC, unlike `toISOString`). */
export function todayDateOnly(): string {
  return toDateOnly(new Date())
}

/** `days` days before today, as YYYY-MM-DD in local time. */
export function dateOnlyDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return toDateOnly(d)
}

/** A millisecond timestamp's own date, as YYYY-MM-DD in local time. */
export function dateOnlyFromTimestamp(ms: number): string {
  return toDateOnly(new Date(ms))
}

function toMonthOnly(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

/** YYYY-MM for `months` months before the current month (0 = this month),
 *  local time. Pins to the 1st before subtracting so a 31st doesn't roll
 *  `setMonth` into the wrong month. */
export function monthKeyMonthsAgo(months: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - months)
  return toMonthOnly(d)
}

/** A millisecond timestamp's own month, as YYYY-MM in local time. */
export function monthKeyFromTimestamp(ms: number): string {
  return toMonthOnly(new Date(ms))
}

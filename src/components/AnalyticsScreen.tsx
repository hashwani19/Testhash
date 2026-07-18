import { useMemo, useState } from 'react'
import type { EyeVisit, Patient } from '../types'
import {
  ageDistribution,
  genderDistribution,
  newPatientsByPeriod,
  visitsByPeriodSplitNewReturning,
  type Granularity,
} from '../utils/analyticsQuery'
import { useChartColors } from '../hooks/useChartColors'
import { TimeSeriesBarChart } from './common/charts/TimeSeriesBarChart'
import { CategoryBarChart } from './common/charts/CategoryBarChart'
import { Card, CardHeader } from './common/Card'
import { Button } from './common/Button'
import { Breadcrumb } from './common/Breadcrumb'
import { screenHeading, cx } from '../styles'

interface Props {
  patients: Patient[]
  visits: EyeVisit[]
  onBack: () => void
}

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
]

function GranularityToggle({ value, onChange }: { value: Granularity; onChange: (g: Granularity) => void }) {
  return (
    <div className="inline-flex gap-1 rounded-lg border border-border bg-bg p-1">
      {GRANULARITY_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant="unstyled"
          className={cx(
            'cursor-pointer rounded-md px-3 py-1 text-[13px] font-semibold',
            opt.value === value ? 'bg-accent text-accent-contrast' : 'bg-transparent text-text',
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}

/**
 * Analytics section (docs/design.md §5.7) — admin + doctor only. Day
 * granularity shows a rolling last-30-days window; month granularity shows
 * the last 12 months, so the "how far back" question has a different,
 * appropriate answer at each zoom level rather than trying to cram a full
 * year of daily bars into one mobile-width chart.
 */
export function AnalyticsScreen({ patients, visits, onBack }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('month')
  const colors = useChartColors()
  // Fixed order, matching GENDER_ORDER in analyticsQuery.ts and the
  // --chart-N tokens' own fixed hue order — a category's color never
  // depends on counts.
  const categoricalColors = useMemo(
    () => [colors['--chart-1'], colors['--chart-2'], colors['--chart-3'], colors['--chart-4']],
    [colors],
  )

  const newPatients = useMemo(() => newPatientsByPeriod(patients, granularity), [patients, granularity])
  const visitsByPeriod = useMemo(
    () => visitsByPeriodSplitNewReturning(visits, granularity),
    [visits, granularity],
  )
  const genderData = useMemo(
    () =>
      genderDistribution(patients).map((g, i) => ({
        label: g.label,
        value: g.count,
        color: categoricalColors[i % categoricalColors.length],
      })),
    [patients, categoricalColors],
  )
  const ageData = useMemo(
    () => ageDistribution(patients).map((a) => ({ label: a.label, value: a.count, color: colors['--accent'] })),
    [patients, colors],
  )

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb onClick={onBack} />
      <h2 className={screenHeading}>Analytics</h2>

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-text-h">Patient growth</h3>
        <GranularityToggle value={granularity} onChange={setGranularity} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-2">
          <CardHeader title="New patients" />
          <TimeSeriesBarChart
            data={newPatients}
            series={[{ dataKey: 'count', label: 'New patients', color: 'var(--accent)' }]}
          />
        </Card>

        <Card className="flex flex-col gap-2">
          <CardHeader title="Visits — new vs. returning" />
          <TimeSeriesBarChart
            data={visitsByPeriod}
            series={[
              { dataKey: 'newCount', label: 'New', color: 'var(--chart-1)' },
              { dataKey: 'returningCount', label: 'Returning', color: 'var(--chart-2)' },
            ]}
          />
        </Card>
      </div>

      <h3 className="text-base font-bold text-text-h">Patient demographics</h3>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-2">
          <CardHeader title="Gender" />
          <CategoryBarChart data={genderData} />
        </Card>

        <Card className="flex flex-col gap-2">
          <CardHeader title="Age" />
          <CategoryBarChart data={ageData} />
        </Card>
      </div>
    </div>
  )
}

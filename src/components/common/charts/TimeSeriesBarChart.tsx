import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface ChartSeries<T> {
  dataKey: keyof T & string
  label: string
  color: string
}

interface Props<T extends { label: string }> {
  data: T[]
  series: ChartSeries<T>[]
  height?: number
}

const TICK_STYLE = { fill: 'var(--text)', fontSize: 11 }
const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--text-h)',
}

// A month view has 12 labels (all fit); a day view has 30 — thin those down
// to roughly one label per 5 bars so they don't overlap on a ~450px-wide
// mobile chart.
function tickInterval(count: number, maxTicks = 7): number {
  return Math.max(0, Math.ceil(count / maxTicks) - 1)
}

/**
 * Vertical bar chart for a count-per-period series (docs/design.md §5.7).
 * One series renders as plain bars with no legend — its title already says
 * what's plotted (the dataviz skill: "a single series needs no legend
 * box"). Two or more stack, with a 2px surface-color gap between segments
 * (a stroke in the surface color, not a border ink) and a legend, since
 * color-matching alone is never the only identity channel.
 */
export function TimeSeriesBarChart<T extends { label: string }>({ data, series, height = 220 }: Props<T>) {
  const stacked = series.length > 1
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={TICK_STYLE}
          axisLine={{ stroke: 'var(--border)' }}
          tickLine={false}
          interval={tickInterval(data.length)}
        />
        <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
        <Tooltip
          cursor={{ fill: 'var(--border)', opacity: 0.4 }}
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={{ color: 'var(--text-h)', fontWeight: 600 }}
        />
        {stacked && <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text)' }} />}
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            // Recharts 3 tries to structurally verify dataKey against the
            // chart's inferred data type, which isn't resolvable against
            // this component's own generic T from inside its body — the
            // real safety (dataKey must be a key of T) is already enforced
            // by ChartSeries<T>'s type above, at every call site.
            dataKey={s.dataKey as unknown as string}
            name={s.label}
            stackId={stacked ? 'stack' : undefined}
            fill={s.color}
            radius={!stacked || i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            stroke={stacked ? 'var(--surface)' : undefined}
            strokeWidth={stacked ? 2 : undefined}
            maxBarSize={24}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

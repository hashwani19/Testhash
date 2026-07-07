import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface CategoryDatum {
  label: string
  value: number
  color: string
}

interface Props {
  data: CategoryDatum[]
  height?: number
}

const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--text-h)',
}

/**
 * Horizontal bar chart comparing counts across a fixed set of categories
 * (docs/design.md §5.7) — a bar, not a donut: the dataviz skill's own
 * anti-pattern list flags donuts for anything beyond a rough at-a-glance
 * read, and this data (e.g. gender counts) is meant to be compared exactly.
 * Each category already carries its own axis label, so no legend — a
 * legend here would just restate the axis. Direct value labels sit at each
 * bar's tip since two of the four categorical colors fall under 3:1
 * contrast on a light surface (validated palette, docs/design.md §5.7).
 */
export function CategoryBarChart({ data, height }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height ?? 40 * data.length + 20}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 4, bottom: 4 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: 'var(--text-h)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip cursor={{ fill: 'var(--border)', opacity: 0.4 }} contentStyle={TOOLTIP_CONTENT_STYLE} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((d) => (
            <Cell key={d.label} fill={d.color} />
          ))}
          <LabelList dataKey="value" position="right" style={{ fill: 'var(--text-h)', fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

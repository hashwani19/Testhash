import type { EyeRecord, EyeValues } from '../types'

interface Props {
  records: EyeRecord[]
  onDelete: (id: string) => void
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
}

function EyeValuesRow({ label, values }: { label: string; values: EyeValues }) {
  return (
    <div className="eye-values-row">
      <span className="eye-values-label">{label}</span>
      <span className="eye-values-cell">SPH {formatSigned(values.sphere)}</span>
      <span className="eye-values-cell">CYL {formatSigned(values.cylinder)}</span>
      <span className="eye-values-cell">Dist {formatSigned(values.distance)}</span>
    </div>
  )
}

export function EyeRecordHistory({ records, onDelete }: Props) {
  if (records.length === 0) {
    return <p className="empty-state">No history yet. Add the first eye record.</p>
  }

  return (
    <ul className="record-list">
      {records.map((record) => (
        <li key={record.id} className="record-card">
          <div className="record-card-header">
            <span className="record-date">
              {new Date(record.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <button
              className="btn-icon"
              aria-label="Delete record"
              onClick={() => onDelete(record.id)}
            >
              ×
            </button>
          </div>
          <EyeValuesRow label="L" values={record.left} />
          <EyeValuesRow label="R" values={record.right} />
          {record.notes && <p className="record-notes">{record.notes}</p>}
        </li>
      ))}
    </ul>
  )
}

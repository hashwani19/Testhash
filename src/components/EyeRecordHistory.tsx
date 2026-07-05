import type { Eye, EyeRefraction, EyeVisit, VisionType } from '../types'

interface Props {
  visits: EyeVisit[]
  canDelete: boolean
  onDelete: (id: string) => void
}

function formatSigned(value?: number): string {
  if (value == null) return '—'
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
}

function RefractionRow({ visionType, refraction }: { visionType: VisionType; refraction: EyeRefraction }) {
  const label = visionType === 'distance' ? 'Dist' : 'Read'
  return (
    <div className="eye-values-row">
      <span className="eye-values-label">{label}</span>
      <span className="eye-values-cell">SPH {formatSigned(refraction.sphere)}</span>
      <span className="eye-values-cell">CYL {formatSigned(refraction.cylinder)}</span>
      <span className="eye-values-cell">
        Axis {refraction.axis != null ? refraction.axis : '—'}
      </span>
      {visionType === 'reading' && (
        <span className="eye-values-cell">Add {formatSigned(refraction.addPower)}</span>
      )}
      <span className="eye-values-cell">VA {refraction.visualAcuity || '—'}</span>
    </div>
  )
}

function EyeSection({ eye, refractions }: { eye: Eye; refractions: EyeVisit['refractions'][Eye] }) {
  return (
    <div className="eye-section">
      <span className="eye-section-label">{eye === 'left' ? 'Left' : 'Right'} eye</span>
      <RefractionRow visionType="distance" refraction={refractions.distance} />
      <RefractionRow visionType="reading" refraction={refractions.reading} />
    </div>
  )
}

export function EyeRecordHistory({ visits, canDelete, onDelete }: Props) {
  if (visits.length === 0) {
    return <p className="empty-state">No history yet. Add the first eye record.</p>
  }

  return (
    <ul className="record-list">
      {visits.map((visit) => (
        <li key={visit.id} className="record-card">
          <div className="record-card-header">
            <span className="record-date">
              {new Date(visit.visitAt).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            {canDelete && (
              <button className="btn-icon" aria-label="Delete record" onClick={() => onDelete(visit.id)}>
                ×
              </button>
            )}
          </div>
          <EyeSection eye="left" refractions={visit.refractions.left} />
          <EyeSection eye="right" refractions={visit.refractions.right} />
          {visit.lenses && (
            <p className="record-notes">
              <strong>Lenses:</strong> {visit.lenses}
            </p>
          )}
          {visit.diagnosis && (
            <p className="record-notes">
              <strong>Diagnosis:</strong> {visit.diagnosis}
            </p>
          )}
          {visit.treatmentPlan && (
            <p className="record-notes">
              <strong>Treatment plan:</strong> {visit.treatmentPlan}
            </p>
          )}
          {visit.notes && <p className="record-notes">{visit.notes}</p>}
        </li>
      ))}
    </ul>
  )
}

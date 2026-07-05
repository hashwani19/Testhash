import type { Eye, EyeRefraction, EyeVisit, VisionType } from '../types'
import { btnIcon } from '../styles'

interface Props {
  visits: EyeVisit[]
  canDelete: boolean
  onEdit: (visit: EyeVisit) => void
  onDelete: (id: string) => void
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
}

// Add power is captured on the form but intentionally not shown in this
// summary view, so visibility here is based only on what's actually
// displayed (sphere/cylinder/axis/VA) — a row with only an Add power set
// would otherwise render its label with nothing next to it.
function hasDisplayedValues(refraction: EyeRefraction): boolean {
  return (
    refraction.sphere != null ||
    refraction.cylinder != null ||
    refraction.axis != null ||
    Boolean(refraction.visualAcuity)
  )
}

function RefractionRow({ visionType, refraction }: { visionType: VisionType; refraction: EyeRefraction }) {
  if (!hasDisplayedValues(refraction)) return null

  const label = visionType === 'distance' ? 'Dist' : 'Read'
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-text">
      {/* Deliberately subdued relative to the Left/Right eye label above,
          but same baseline/family as the values so the row reads as one
          row rather than two mismatched fonts. */}
      <span className="min-w-[34px] text-[12px] font-semibold uppercase tracking-wide text-text-h">
        {label}
      </span>
      {refraction.sphere != null && <span>SPH {formatSigned(refraction.sphere)}</span>}
      {refraction.cylinder != null && <span>CYL {formatSigned(refraction.cylinder)}</span>}
      {refraction.axis != null && <span>Axis {refraction.axis}</span>}
      {refraction.visualAcuity && <span>VA {refraction.visualAcuity}</span>}
    </div>
  )
}

function EyeSection({ eye, refractions }: { eye: Eye; refractions: EyeVisit['refractions'][Eye] }) {
  if (!hasDisplayedValues(refractions.distance) && !hasDisplayedValues(refractions.reading)) {
    return null
  }
  return (
    <div className="flex flex-col gap-1 border-t border-border py-2 first:border-t-0 first:pt-0">
      <span className="text-base font-bold text-text-h">{eye === 'left' ? 'Left' : 'Right'} eye</span>
      <RefractionRow visionType="distance" refraction={refractions.distance} />
      <RefractionRow visionType="reading" refraction={refractions.reading} />
    </div>
  )
}

export function EyeRecordHistory({ visits, canDelete, onEdit, onDelete }: Props) {
  if (visits.length === 0) {
    return <p className="py-8 text-center text-sm text-text">No history yet. Add the first eye record.</p>
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {visits.map((visit) => (
        <li key={visit.id} className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-h">
              {new Date(visit.visitAt).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="cursor-pointer rounded-lg border-none bg-transparent px-2 py-1 text-[13px] font-medium text-accent"
                aria-label="Edit record"
                onClick={() => onEdit(visit)}
              >
                Edit
              </button>
              {canDelete && (
                <button className={btnIcon} aria-label="Delete record" onClick={() => onDelete(visit.id)}>
                  ×
                </button>
              )}
            </div>
          </div>
          <EyeSection eye="left" refractions={visit.refractions.left} />
          <EyeSection eye="right" refractions={visit.refractions.right} />
          {visit.lenses && (
            <p className="mt-1 text-[13px] text-text">
              <strong>Lenses:</strong> {visit.lenses}
            </p>
          )}
          {visit.diagnosis && (
            <p className="mt-1 text-[13px] text-text">
              <strong>Diagnosis:</strong> {visit.diagnosis}
            </p>
          )}
          {visit.treatmentPlan && (
            <p className="mt-1 text-[13px] text-text">
              <strong>Treatment plan:</strong> {visit.treatmentPlan}
            </p>
          )}
          {visit.notes && <p className="mt-1 text-[13px] text-text">{visit.notes}</p>}
        </li>
      ))}
    </ul>
  )
}

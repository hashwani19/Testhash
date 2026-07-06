import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { EyeVisitInput } from '../hooks/useEyeVisits'
import type { Eye, EyeRefraction, EyeVisit, RefractionGrid, VisionType } from '../types'
import { isEmptyVisit } from '../utils/eyeVisit'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { Textarea } from './common/Textarea'
import { card, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  initial?: EyeVisit
  onSubmit: (input: EyeVisitInput) => void
  onCancel: () => void
}

interface CellState {
  sphere: string
  cylinder: string
  axis: string
  visualAcuity: string
}

const EMPTY_CELL: CellState = { sphere: '', cylinder: '', axis: '', visualAcuity: '' }

type GridState = Record<Eye, Record<VisionType, CellState>>

const EMPTY_GRID: GridState = {
  left: { distance: { ...EMPTY_CELL }, reading: { ...EMPTY_CELL } },
  right: { distance: { ...EMPTY_CELL }, reading: { ...EMPTY_CELL } },
}

const toLocalInputValue = (date: Date) => {
  const d = new Date(date)
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const nowLocal = () => toLocalInputValue(new Date())

function cellToRefraction(cell: CellState): EyeRefraction {
  return {
    sphere: cell.sphere ? Number(cell.sphere) : undefined,
    cylinder: cell.cylinder ? Number(cell.cylinder) : undefined,
    axis: cell.axis ? Number(cell.axis) : undefined,
    visualAcuity: cell.visualAcuity.trim() || undefined,
  }
}

function refractionToCell(refraction: EyeRefraction): CellState {
  return {
    sphere: refraction.sphere != null ? String(refraction.sphere) : '',
    cylinder: refraction.cylinder != null ? String(refraction.cylinder) : '',
    axis: refraction.axis != null ? String(refraction.axis) : '',
    visualAcuity: refraction.visualAcuity ?? '',
  }
}

function gridToState(refractions: RefractionGrid): GridState {
  return {
    left: {
      distance: refractionToCell(refractions.left.distance),
      reading: refractionToCell(refractions.left.reading),
    },
    right: {
      distance: refractionToCell(refractions.right.distance),
      reading: refractionToCell(refractions.right.reading),
    },
  }
}

function RefractionCell({
  visionType,
  cell,
  onChange,
}: {
  visionType: VisionType
  cell: CellState
  onChange: (next: CellState) => void
}) {
  const label = visionType === 'distance' ? 'Distance' : 'Reading'
  return (
    <div className="flex flex-col gap-2 border-t border-border py-2 first:border-t-0 first:pt-0">
      {/* Deliberately subdued relative to the Left/Right eye legend above. */}
      <span className="text-[11px] font-medium uppercase tracking-wide text-text opacity-85">
        {label}
      </span>
      <div className="flex flex-wrap gap-2.5">
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Sphere</span>
          <TextInput
            type="number"
            step="any"
            inputMode="decimal"
            value={cell.sphere}
            onChange={(e) => onChange({ ...cell, sphere: e.target.value })}
            placeholder="0.00"
          />
        </label>
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Cylinder</span>
          <TextInput
            type="number"
            step="any"
            inputMode="decimal"
            value={cell.cylinder}
            onChange={(e) => onChange({ ...cell, cylinder: e.target.value })}
            placeholder="0.00"
          />
        </label>
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Axis</span>
          <TextInput
            type="number"
            min={0}
            max={180}
            step={1}
            inputMode="numeric"
            value={cell.axis}
            onChange={(e) => onChange({ ...cell, axis: e.target.value })}
            placeholder="0-180"
          />
        </label>
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Visual acuity</span>
          <TextInput
            type="text"
            value={cell.visualAcuity}
            onChange={(e) => onChange({ ...cell, visualAcuity: e.target.value })}
            placeholder={visionType === 'distance' ? '6/6' : 'N/6'}
          />
        </label>
      </div>
    </div>
  )
}

export function EyeRecordForm({ initial, onSubmit, onCancel }: Props) {
  const [visitAt, setVisitAt] = useState(
    initial ? toLocalInputValue(new Date(initial.visitAt)) : nowLocal(),
  )
  const [grid, setGrid] = useState<GridState>(
    initial ? gridToState(initial.refractions) : EMPTY_GRID,
  )
  const [lenses, setLenses] = useState(initial?.lenses ?? '')
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis ?? '')
  const [treatmentPlan, setTreatmentPlan] = useState(initial?.treatmentPlan ?? '')
  const [followUpDate, setFollowUpDate] = useState(initial?.followUpDate ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const setCell = (eye: Eye, visionType: VisionType, next: CellState) => {
    setGrid((prev) => ({ ...prev, [eye]: { ...prev[eye], [visionType]: next } }))
  }

  const refractions: RefractionGrid = useMemo(
    () => ({
      left: {
        distance: cellToRefraction(grid.left.distance),
        reading: cellToRefraction(grid.left.reading),
      },
      right: {
        distance: cellToRefraction(grid.right.distance),
        reading: cellToRefraction(grid.right.reading),
      },
    }),
    [grid],
  )

  const isEmpty = isEmptyVisit(refractions, [lenses, diagnosis, treatmentPlan, followUpDate, notes])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (isEmpty) return
    onSubmit({
      visitAt: new Date(visitAt).toISOString(),
      refractions,
      lenses,
      diagnosis,
      treatmentPlan,
      followUpDate,
      notes,
    })
  }

  return (
    <form className={`${card} flex flex-col gap-3.5`} onSubmit={submit}>
      <label className={fieldLabel}>
        <span className={fieldLabelText}>Visit date &amp; time</span>
        <TextInput
          type="datetime-local"
          value={visitAt}
          max={nowLocal()}
          onChange={(e) => setVisitAt(e.target.value)}
          required
        />
      </label>

      {(['left', 'right'] as Eye[]).map((eye) => (
        // min-w-0 is required: fieldsets don't shrink in flex layouts by
        // default, so without it this overflows past the card's edge.
        <fieldset className="min-w-0 rounded-xl border border-border p-3" key={eye}>
          <legend className="px-2 text-[17px] font-bold text-text-h">
            {eye === 'left' ? 'Left' : 'Right'} eye
          </legend>
          <RefractionCell
            visionType="distance"
            cell={grid[eye].distance}
            onChange={(next) => setCell(eye, 'distance', next)}
          />
          <RefractionCell
            visionType="reading"
            cell={grid[eye].reading}
            onChange={(next) => setCell(eye, 'reading', next)}
          />
        </fieldset>
      ))}

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Lenses (optional)</span>
        <TextInput
          type="text"
          value={lenses}
          onChange={(e) => setLenses(e.target.value)}
          placeholder="Progressive, bifocal, single vision…"
        />
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Diagnosis (optional)</span>
        <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} />
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Treatment plan (optional)</span>
        <Textarea value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} rows={2} />
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Follow-up date (optional)</span>
        <TextInput
          type="date"
          value={followUpDate}
          min={visitAt.slice(0, 10)}
          onChange={(e) => setFollowUpDate(e.target.value)}
        />
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Notes (optional)</span>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Other observations…"
        />
      </label>

      {isEmpty && (
        <p className="text-right text-[13px] text-text">
          Enter at least one value below the visit date to save a record.
        </p>
      )}

      <div className="flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isEmpty}>
          {initial ? 'Save changes' : 'Save record'}
        </Button>
      </div>
    </form>
  )
}

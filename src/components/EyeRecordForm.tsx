import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { EyeVisitInput } from '../hooks/useEyeVisits'
import type { Eye, EyeRefraction, EyeVisit, RefractionGrid, VisionType } from '../types'
import { isEmptyVisit } from '../utils/eyeVisit'
import { btnPrimary, btnSecondary, card, fieldInput, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  initial?: EyeVisit
  onSubmit: (input: EyeVisitInput) => void
  onCancel: () => void
}

interface CellState {
  sphere: string
  cylinder: string
  axis: string
  addPower: string
  visualAcuity: string
}

const EMPTY_CELL: CellState = { sphere: '', cylinder: '', axis: '', addPower: '', visualAcuity: '' }

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
    addPower: cell.addPower ? Number(cell.addPower) : undefined,
    visualAcuity: cell.visualAcuity.trim() || undefined,
  }
}

function refractionToCell(refraction: EyeRefraction): CellState {
  return {
    sphere: refraction.sphere != null ? String(refraction.sphere) : '',
    cylinder: refraction.cylinder != null ? String(refraction.cylinder) : '',
    axis: refraction.axis != null ? String(refraction.axis) : '',
    addPower: refraction.addPower != null ? String(refraction.addPower) : '',
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
          <input
            type="number"
            className={fieldInput}
            step="any"
            inputMode="decimal"
            value={cell.sphere}
            onChange={(e) => onChange({ ...cell, sphere: e.target.value })}
            placeholder="0.00"
          />
        </label>
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Cylinder</span>
          <input
            type="number"
            className={fieldInput}
            step="any"
            inputMode="decimal"
            value={cell.cylinder}
            onChange={(e) => onChange({ ...cell, cylinder: e.target.value })}
            placeholder="0.00"
          />
        </label>
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Axis</span>
          <input
            type="number"
            className={fieldInput}
            min={0}
            max={180}
            step={1}
            inputMode="numeric"
            value={cell.axis}
            onChange={(e) => onChange({ ...cell, axis: e.target.value })}
            placeholder="0-180"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {visionType === 'reading' && (
          <label className={`${fieldLabel} min-w-[90px]`}>
            <span className={fieldLabelText}>Add</span>
            <input
              type="number"
              className={fieldInput}
              step="any"
              inputMode="decimal"
              value={cell.addPower}
              onChange={(e) => onChange({ ...cell, addPower: e.target.value })}
              placeholder="0.00"
            />
          </label>
        )}
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Visual acuity</span>
          <input
            type="text"
            className={fieldInput}
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

  const isEmpty = isEmptyVisit(refractions, [lenses, diagnosis, treatmentPlan, notes])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (isEmpty) return
    onSubmit({
      visitAt: new Date(visitAt).toISOString(),
      refractions,
      lenses,
      diagnosis,
      treatmentPlan,
      notes,
    })
  }

  return (
    <form className={`${card} flex flex-col gap-3.5`} onSubmit={submit}>
      <label className={fieldLabel}>
        <span className={fieldLabelText}>Visit date &amp; time</span>
        <input
          type="datetime-local"
          className={fieldInput}
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
        <input
          type="text"
          className={fieldInput}
          value={lenses}
          onChange={(e) => setLenses(e.target.value)}
          placeholder="Progressive, bifocal, single vision…"
        />
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Diagnosis (optional)</span>
        <textarea
          className={fieldInput}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          rows={2}
        />
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Treatment plan (optional)</span>
        <textarea
          className={fieldInput}
          value={treatmentPlan}
          onChange={(e) => setTreatmentPlan(e.target.value)}
          rows={2}
        />
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Notes (optional)</span>
        <textarea
          className={fieldInput}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Other observations, follow-up…"
        />
      </label>

      {isEmpty && (
        <p className="text-right text-[13px] text-text">
          Enter at least one value below the visit date to save a record.
        </p>
      )}

      <div className="flex justify-end gap-2.5">
        <button type="button" className={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary} disabled={isEmpty}>
          {initial ? 'Save changes' : 'Save record'}
        </button>
      </div>
    </form>
  )
}

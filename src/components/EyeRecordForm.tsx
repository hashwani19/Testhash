import { useState } from 'react'
import type { FormEvent } from 'react'
import type { EyeVisitInput } from '../hooks/useEyeVisits'
import type { Eye, EyeRefraction, RefractionGrid, VisionType } from '../types'

interface Props {
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

const nowLocal = () => {
  const d = new Date()
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function cellToRefraction(cell: CellState): EyeRefraction {
  return {
    sphere: cell.sphere ? Number(cell.sphere) : undefined,
    cylinder: cell.cylinder ? Number(cell.cylinder) : undefined,
    axis: cell.axis ? Number(cell.axis) : undefined,
    addPower: cell.addPower ? Number(cell.addPower) : undefined,
    visualAcuity: cell.visualAcuity.trim() || undefined,
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
    <div className="refraction-cell">
      <span className="refraction-cell-label">{label}</span>
      <div className="field-row">
        <label className="field">
          <span>Sphere</span>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={cell.sphere}
            onChange={(e) => onChange({ ...cell, sphere: e.target.value })}
            placeholder="0.00"
          />
        </label>
        <label className="field">
          <span>Cylinder</span>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={cell.cylinder}
            onChange={(e) => onChange({ ...cell, cylinder: e.target.value })}
            placeholder="0.00"
          />
        </label>
        <label className="field">
          <span>Axis</span>
          <input
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
      </div>
      <div className="field-row">
        {visionType === 'reading' && (
          <label className="field">
            <span>Add</span>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              value={cell.addPower}
              onChange={(e) => onChange({ ...cell, addPower: e.target.value })}
              placeholder="0.00"
            />
          </label>
        )}
        <label className="field">
          <span>Visual acuity</span>
          <input
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

export function EyeRecordForm({ onSubmit, onCancel }: Props) {
  const [visitAt, setVisitAt] = useState(nowLocal())
  const [grid, setGrid] = useState<GridState>(EMPTY_GRID)
  const [lenses, setLenses] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatmentPlan, setTreatmentPlan] = useState('')
  const [notes, setNotes] = useState('')

  const setCell = (eye: Eye, visionType: VisionType, next: CellState) => {
    setGrid((prev) => ({ ...prev, [eye]: { ...prev[eye], [visionType]: next } }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const refractions: RefractionGrid = {
      left: {
        distance: cellToRefraction(grid.left.distance),
        reading: cellToRefraction(grid.left.reading),
      },
      right: {
        distance: cellToRefraction(grid.right.distance),
        reading: cellToRefraction(grid.right.reading),
      },
    }
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
    <form className="panel-form" onSubmit={submit}>
      <label className="field">
        <span>Visit date &amp; time</span>
        <input
          type="datetime-local"
          value={visitAt}
          max={nowLocal()}
          onChange={(e) => setVisitAt(e.target.value)}
          required
        />
      </label>

      {(['left', 'right'] as Eye[]).map((eye) => (
        <fieldset className="eye-fieldset" key={eye}>
          <legend>{eye === 'left' ? 'Left' : 'Right'} eye</legend>
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

      <label className="field">
        <span>Lenses (optional)</span>
        <input
          type="text"
          value={lenses}
          onChange={(e) => setLenses(e.target.value)}
          placeholder="Progressive, bifocal, single vision…"
        />
      </label>

      <label className="field">
        <span>Diagnosis (optional)</span>
        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} />
      </label>

      <label className="field">
        <span>Treatment plan (optional)</span>
        <textarea
          value={treatmentPlan}
          onChange={(e) => setTreatmentPlan(e.target.value)}
          rows={2}
        />
      </label>

      <label className="field">
        <span>Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Other observations, follow-up…"
        />
      </label>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save record
        </button>
      </div>
    </form>
  )
}

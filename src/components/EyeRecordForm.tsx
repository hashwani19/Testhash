import { useState } from 'react'
import type { FormEvent } from 'react'
import type { EyeRecordInput } from '../hooks/useEyeRecords'

interface Props {
  onSubmit: (input: EyeRecordInput) => void
  onCancel: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

function EyeFieldset({
  side,
  sphere,
  cylinder,
  distance,
  onSphere,
  onCylinder,
  onDistance,
}: {
  side: 'Left' | 'Right'
  sphere: string
  cylinder: string
  distance: string
  onSphere: (v: string) => void
  onCylinder: (v: string) => void
  onDistance: (v: string) => void
}) {
  return (
    <fieldset className="eye-fieldset">
      <legend>{side} eye</legend>
      <div className="field-row">
        <label className="field">
          <span>Sphere</span>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={sphere}
            onChange={(e) => onSphere(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label className="field">
          <span>Cylinder</span>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={cylinder}
            onChange={(e) => onCylinder(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label className="field">
          <span>Distance</span>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={distance}
            onChange={(e) => onDistance(e.target.value)}
            placeholder="0.00"
          />
        </label>
      </div>
    </fieldset>
  )
}

export function EyeRecordForm({ onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(today())
  const [leftSphere, setLeftSphere] = useState('')
  const [leftCylinder, setLeftCylinder] = useState('')
  const [leftDistance, setLeftDistance] = useState('')
  const [rightSphere, setRightSphere] = useState('')
  const [rightCylinder, setRightCylinder] = useState('')
  const [rightDistance, setRightDistance] = useState('')
  const [notes, setNotes] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      date,
      left: {
        sphere: Number(leftSphere) || 0,
        cylinder: Number(leftCylinder) || 0,
        distance: Number(leftDistance) || 0,
      },
      right: {
        sphere: Number(rightSphere) || 0,
        cylinder: Number(rightCylinder) || 0,
        distance: Number(rightDistance) || 0,
      },
      notes,
    })
  }

  return (
    <form className="panel-form" onSubmit={submit}>
      <label className="field">
        <span>Visit date</span>
        <input
          type="date"
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <EyeFieldset
        side="Left"
        sphere={leftSphere}
        cylinder={leftCylinder}
        distance={leftDistance}
        onSphere={setLeftSphere}
        onCylinder={setLeftCylinder}
        onDistance={setLeftDistance}
      />

      <EyeFieldset
        side="Right"
        sphere={rightSphere}
        cylinder={rightCylinder}
        distance={rightDistance}
        onSphere={setRightSphere}
        onCylinder={setRightCylinder}
        onDistance={setRightDistance}
      />

      <label className="field">
        <span>Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Observations, diagnosis, follow-up…"
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

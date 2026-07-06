import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Gender, Patient, PatientGroup } from '../types'
import type { PatientInput } from '../hooks/usePatients'
import { computeAgeFromDob } from '../utils/age'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { Select } from './common/Select'
import { Textarea } from './common/Textarea'
import { card, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  /** A full Patient (editing) or a partial prefill (e.g. from an
   *  appointment's new-patient details) — only a full Patient has `id`,
   *  which is what distinguishes "editing" from "creating" below. */
  initial?: Partial<Patient>
  groups: PatientGroup[]
  onSubmit: (input: PatientInput) => void
  onCancel: () => void
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'unspecified', label: 'Prefer not to say' },
]

export function PatientForm({ initial, groups, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dob, setDob] = useState(initial?.dob ?? '')
  const [manualAge, setManualAge] = useState(
    initial?.manualAge != null ? String(initial.manualAge) : '',
  )
  const [address, setAddress] = useState(initial?.address ?? '')
  const [mobile, setMobile] = useState(initial?.mobile ?? '')
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'unspecified')
  const [groupId, setGroupId] = useState(initial?.groupId ?? '')

  const isEditingExisting = Boolean(initial?.id)
  const computedAge = dob ? computeAgeFromDob(dob) : undefined

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onSubmit({
      name: trimmedName,
      dob: dob || undefined,
      manualAge: manualAge ? Number(manualAge) : undefined,
      address,
      mobile: mobile || undefined,
      gender,
      groupId: groupId || undefined,
    })
  }

  return (
    <form className={`${card} flex flex-col gap-3.5`} onSubmit={submit}>
      <label className={fieldLabel}>
        <span className={fieldLabelText}>Name</span>
        <TextInput
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
        />
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Mobile number</span>
        <TextInput
          type="tel"
          inputMode="numeric"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="10-digit mobile number"
          pattern="[6-9][0-9]{9}"
          title="10-digit Indian mobile number"
        />
      </label>

      <div className="flex flex-wrap gap-2.5">
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Date of birth</span>
          <TextInput
            type="date"
            value={dob}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDob(e.target.value)}
          />
        </label>

        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Age {dob ? '(from DOB)' : ''}</span>
          <TextInput
            type="number"
            inputMode="numeric"
            min={0}
            max={130}
            step={1}
            value={dob ? (computedAge ?? '') : manualAge}
            onChange={(e) => setManualAge(e.target.value)}
            disabled={Boolean(dob)}
            placeholder="Age"
          />
        </label>
      </div>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Gender</span>
        <Select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Group</span>
        <Select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">No group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Address</span>
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street, city, postal code"
          rows={2}
        />
      </label>

      <div className="flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!name.trim()}>
          {isEditingExisting ? 'Save changes' : 'Add patient'}
        </Button>
      </div>
    </form>
  )
}

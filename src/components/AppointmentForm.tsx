import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Appointment, Patient } from '../types'
import type { AppointmentInput } from '../hooks/useAppointments'
import { computeAgeFromDob } from '../utils/age'
import { MIN_SEARCH_LENGTH } from '../utils/patientQuery'
import { todayDateOnly } from '../utils/date'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { Badge } from './common/Badge'
import { card, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  patients: Patient[]
  /** Editing an existing appointment rather than booking a new one. */
  initial?: Appointment
  onSubmit: (input: AppointmentInput) => void
  onCancel: () => void
}

export function AppointmentForm({ patients, initial, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayDateOnly())
  const [time, setTime] = useState(initial?.time ?? '')

  const [selectedPatientId, setSelectedPatientId] = useState(initial?.patientId ?? '')
  // Doubles as the search query (looking a patient up) and, once nothing
  // matches, the new patient's name — there's no separate "Name" field or
  // an explicit existing/new mode switch to reason about (§8.11).
  const [nameInput, setNameInput] = useState(initial?.patientId ? '' : (initial?.name ?? ''))

  const [dob, setDob] = useState(initial?.dob ?? '')
  const [manualAge, setManualAge] = useState(
    initial?.manualAge != null ? String(initial.manualAge) : '',
  )
  const [mobile, setMobile] = useState(initial?.mobile ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')

  const computedAge = dob ? computeAgeFromDob(dob) : undefined
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null
  const trimmedName = nameInput.trim()

  const matches = useMemo(() => {
    const q = trimmedName.toLowerCase()
    if (selectedPatientId || q.length < MIN_SEARCH_LENGTH) return []
    return patients
      .filter((p) => p.name.toLowerCase().includes(q) || p.patientNumber.toLowerCase().includes(q))
      .slice(0, 8)
  }, [patients, trimmedName, selectedPatientId])

  // Live, not button-gated: as soon as there's enough typed text to search
  // on and it matches nobody, the new-patient fields just appear.
  const showNewPatientFields = !selectedPatientId && trimmedName.length >= MIN_SEARCH_LENGTH && matches.length === 0

  const clearSelection = () => {
    setSelectedPatientId('')
    setNameInput('')
    setDob('')
    setManualAge('')
    setMobile('')
    setAddress('')
  }

  // Effective values — what would actually be submitted, e.g. dob overrides
  // manualAge regardless of what's left sitting in the manualAge field.
  const effectiveTime = time || undefined
  const effectiveDob = dob || undefined
  const effectiveManualAge = dob ? undefined : manualAge ? Number(manualAge) : undefined
  const effectiveMobile = mobile || undefined
  const effectiveAddress = address || undefined

  // Editing an existing appointment: "Save changes" stays disabled until
  // something actually differs from what was loaded, rather than being
  // active the instant the form opens with nothing touched yet.
  const isDirty =
    !initial ||
    date !== initial.date ||
    effectiveTime !== initial.time ||
    (selectedPatientId || undefined) !== initial.patientId ||
    (!selectedPatientId &&
      (trimmedName !== (initial.name ?? '') ||
        effectiveDob !== initial.dob ||
        effectiveManualAge !== initial.manualAge ||
        effectiveMobile !== initial.mobile ||
        effectiveAddress !== initial.address))

  const canSubmit =
    date >= todayDateOnly() && (selectedPatientId !== '' || showNewPatientFields) && isDirty

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      date,
      time: effectiveTime,
      patientId: selectedPatientId || undefined,
      newPatient: !selectedPatientId
        ? {
            name: trimmedName,
            dob: effectiveDob,
            manualAge: effectiveManualAge,
            mobile: effectiveMobile,
            address: effectiveAddress,
          }
        : undefined,
    })
  }

  return (
    <form className={`${card} flex flex-col gap-3.5`} onSubmit={submit}>
      {selectedPatient ? (
        <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3 py-2.5">
          <div>
            <p className="font-semibold text-text-h">{selectedPatient.name}</p>
            <p className="text-[13px] text-text">{selectedPatient.patientNumber}</p>
          </div>
          <Button variant="link" onClick={clearSelection}>
            Change
          </Button>
        </div>
      ) : (
        <>
          <label className={fieldLabel}>
            <span className={fieldLabelText}>Patient name or number</span>
            <TextInput
              type="search"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={`Name or number (${MIN_SEARCH_LENGTH}+ chars)`}
              autoFocus
              required
            />
          </label>

          {matches.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {matches.map((p) => (
                <li key={p.id}>
                  <Button
                    variant="unstyled"
                    className="flex w-full flex-col rounded-lg border border-border bg-bg px-3 py-2 text-left cursor-pointer"
                    onClick={() => {
                      setSelectedPatientId(p.id)
                      setNameInput('')
                    }}
                  >
                    <span className="font-semibold text-text-h">{p.name}</span>
                    <span className="text-[13px] text-text">{p.patientNumber}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {showNewPatientFields && (
            <>
              <Badge>New patient</Badge>

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
                    max={todayDateOnly()}
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
                <span className={fieldLabelText}>Address</span>
                <TextInput
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, postal code"
                />
              </label>
            </>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2.5">
        <label className={`${fieldLabel} min-w-[130px]`}>
          <span className={fieldLabelText}>Date</span>
          <TextInput
            type="date"
            value={date}
            min={todayDateOnly()}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label className={`${fieldLabel} min-w-[100px]`}>
          <span className={fieldLabelText}>Time (optional)</span>
          <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <div className="flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {initial ? 'Save changes' : 'Book appointment'}
        </Button>
      </div>
    </form>
  )
}

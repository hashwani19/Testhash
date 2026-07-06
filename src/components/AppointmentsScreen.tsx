import { useState } from 'react'
import type { Appointment, Patient } from '../types'
import { getPatientAge } from '../utils/age'
import { MIN_SEARCH_LENGTH } from '../utils/patientQuery'
import { resolveAppointmentName } from '../utils/appointmentQuery'
import type { AppointmentSort } from '../utils/appointmentQuery'
import { useAppointmentQuery } from '../hooks/useAppointmentQuery'
import { Button } from './common/Button'
import { SearchBox } from './common/SearchBox'
import { Select } from './common/Select'
import { TextInput } from './common/TextInput'
import { ListView } from './common/ListView'
import { Card } from './common/Card'
import { Badge } from './common/Badge'
import { EditIcon } from './common/icons'
import { ConfirmModal } from './ConfirmModal'
import { fieldLabel, fieldLabelText } from '../styles'

interface Props {
  appointments: Appointment[]
  patients: Patient[]
  /** Admin gets bulk select-all + delete-selected instead of a per-row
   *  delete icon — the other two roles get the per-row icon and no bulk
   *  select UI at all. */
  isAdmin: boolean
  onAddAsPatient: (appointment: Appointment) => void
  onAddVisit: (appointment: Appointment) => void
  onEdit: (appointment: Appointment) => void
  onDelete: (id: string) => void
  onBulkDelete: (ids: string[]) => void
}

// new Date("YYYY-MM-DD") parses as UTC midnight, which can display as the
// previous day in timezones behind UTC — build the Date from local
// components instead (mirrors EyeRecordHistory's formatDateOnly).
function formatDateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(time: string): string {
  const [hour, minute] = time.split(':').map(Number)
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function AppointmentsScreen({
  appointments,
  patients,
  isAdmin,
  onAddAsPatient,
  onAddVisit,
  onEdit,
  onDelete,
  onBulkDelete,
}: Props) {
  const { search, setSearch, from, setFrom, to, setTo, sort, setSort, resetFilters, isFilterActive, results } =
    useAppointmentQuery(appointments, patients)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false)

  const confirmingAppointment = appointments.find((a) => a.id === confirmingDeleteId) ?? null
  const allSelected = results.length > 0 && results.every((a) => selectedIds.has(a.id))

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(results.map((a) => a.id)))
  }

  return (
    <div className="flex flex-col gap-3">
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={`Patient name (${MIN_SEARCH_LENGTH}+ chars)`}
        filter={{
          active: isFilterActive,
          onReset: resetFilters,
          content: (
            <>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>From date</span>
                <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>To date</span>
                <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>Sort</span>
                <Select value={sort} onChange={(e) => setSort(e.target.value as AppointmentSort)}>
                  <option value="default">Soonest first</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </Select>
              </label>
            </>
          ),
        }}
      />

      {isAdmin && results.length > 0 && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[13px] text-text">
            <input type="checkbox" className="accent-accent" checked={allSelected} onChange={toggleSelectAll} />
            Select all
          </label>
          {/* Always mounted (just invisible with nothing selected) so its
           *  height doesn't pop in and shove the list down the moment a
           *  row gets checked — that jump reads as a layout bug. */}
          <Button
            variant="danger"
            className={selectedIds.size === 0 ? 'invisible' : undefined}
            disabled={selectedIds.size === 0}
            onClick={() => setConfirmingBulkDelete(true)}
          >
            Delete selected ({selectedIds.size})
          </Button>
        </div>
      )}

      <ListView
        items={results}
        getKey={(appointment) => appointment.id}
        itemLabel="appointment"
        emptyMessage={
          appointments.length === 0 ? 'No appointments yet. Add the first one.' : 'No appointments match.'
        }
        renderItem={(appointment) => {
          const isNewPatient = !appointment.patientId
          const name = resolveAppointmentName(appointment, patients)
          const linkedPatient = appointment.patientId
            ? patients.find((p) => p.id === appointment.patientId)
            : undefined
          const age = isNewPatient
            ? getPatientAge({ dob: appointment.dob, manualAge: appointment.manualAge })
            : undefined

          // One combined line rather than a separate "date/time" line plus a
          // separate "age/mobile" line — and an unset age is simply omitted,
          // not printed as "Age unknown".
          const details = [formatDateOnly(appointment.date)]
          if (appointment.time) details.push(formatTime(appointment.time))
          if (isNewPatient) {
            if (age != null) details.push(`${age} yrs`)
            if (appointment.mobile) details.push(appointment.mobile)
          } else if (linkedPatient) {
            details.push(linkedPatient.patientNumber)
          }

          return (
            <Card className="flex items-start gap-2">
              {isAdmin && (
                <input
                  type="checkbox"
                  className="mt-1 accent-accent"
                  checked={selectedIds.has(appointment.id)}
                  onChange={() => toggleSelected(appointment.id)}
                  aria-label={`Select ${name}'s appointment`}
                />
              )}

              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-semibold text-text-h">{name}</span>
                {isNewPatient && <Badge>New patient</Badge>}
                <span className="text-[13px] text-text">{details.join(' · ')}</span>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1">
                  <Button variant="icon" aria-label={`Edit ${name}'s appointment`} onClick={() => onEdit(appointment)}>
                    <EditIcon />
                  </Button>
                  {!isAdmin && (
                    <Button
                      variant="icon"
                      aria-label={`Delete ${name}'s appointment`}
                      onClick={() => setConfirmingDeleteId(appointment.id)}
                    >
                      ×
                    </Button>
                  )}
                </div>

                {isNewPatient ? (
                  <Button variant="secondary" onClick={() => onAddAsPatient(appointment)}>
                    Add patient
                  </Button>
                ) : (
                  linkedPatient && (
                    <Button variant="secondary" onClick={() => onAddVisit(appointment)}>
                      Add visit
                    </Button>
                  )
                )}
              </div>
            </Card>
          )
        }}
      />

      {confirmingAppointment && (
        <ConfirmModal
          title="Delete this appointment?"
          warning={`This permanently deletes the appointment for ${resolveAppointmentName(
            confirmingAppointment,
            patients,
          )}. This cannot be undone.`}
          mode="yesNo"
          confirmLabel="Delete"
          tone="danger"
          onConfirm={() => {
            onDelete(confirmingAppointment.id)
            setSelectedIds((prev) => {
              const next = new Set(prev)
              next.delete(confirmingAppointment.id)
              return next
            })
            setConfirmingDeleteId(null)
          }}
          onCancel={() => setConfirmingDeleteId(null)}
        />
      )}

      {confirmingBulkDelete && (
        <ConfirmModal
          title={`Delete ${selectedIds.size} appointment${selectedIds.size === 1 ? '' : 's'}?`}
          warning="This permanently deletes the selected appointments. This cannot be undone."
          mode="yesNo"
          confirmLabel="Delete"
          tone="danger"
          onConfirm={() => {
            onBulkDelete(Array.from(selectedIds))
            setSelectedIds(new Set())
            setConfirmingBulkDelete(false)
          }}
          onCancel={() => setConfirmingBulkDelete(false)}
        />
      )}
    </div>
  )
}

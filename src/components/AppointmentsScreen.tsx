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
import { cardBase } from './common/Card'
import { cx, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  appointments: Appointment[]
  patients: Patient[]
  onAddAsPatient: (appointment: Appointment) => void
  onAddVisit: (appointment: Appointment) => void
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

export function AppointmentsScreen({ appointments, patients, onAddAsPatient, onAddVisit }: Props) {
  const { search, setSearch, from, setFrom, to, setTo, sort, setSort, resetFilters, isFilterActive, results } =
    useAppointmentQuery(appointments, patients)

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

          return (
            <div className={cx(cardBase, 'flex items-start justify-between gap-2')}>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-text-h">
                  {name}
                  {isNewPatient && (
                    <span className="ml-2 rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] font-medium text-text">
                      New patient
                    </span>
                  )}
                </span>
                <span className="text-[13px] text-text">
                  {formatDateOnly(appointment.date)}
                  {appointment.time ? ` · ${formatTime(appointment.time)}` : ''}
                </span>
                {isNewPatient ? (
                  <span className="text-[13px] text-text">
                    {age != null ? `${age} yrs` : 'Age unknown'}
                    {appointment.mobile ? ` · ${appointment.mobile}` : ''}
                  </span>
                ) : (
                  linkedPatient && <span className="text-[13px] text-text">{linkedPatient.patientNumber}</span>
                )}
              </div>

              {isNewPatient ? (
                <Button variant="secondary" onClick={() => onAddAsPatient(appointment)}>
                  Add as patient
                </Button>
              ) : (
                linkedPatient && (
                  <Button variant="secondary" onClick={() => onAddVisit(appointment)}>
                    Add visit
                  </Button>
                )
              )}
            </div>
          )
        }}
      />
    </div>
  )
}

import type { Patient } from '../types'
import { getPatientAge } from '../utils/age'
import { MIN_SEARCH_LENGTH } from '../utils/patientQuery'
import type { PatientSort } from '../utils/patientQuery'
import { usePatientQuery } from '../hooks/usePatientQuery'
import { usePreferences } from '../hooks/usePreferences'
import { Button } from './common/Button'
import { SearchBox } from './common/SearchBox'
import { Select } from './common/Select'
import { ListView } from './common/ListView'
import { ScreenHeader } from './common/ScreenHeader'
import { cardBase } from './common/Card'
import { cx, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  patients: Patient[]
  onSelect: (id: string) => void
  onAddNew: () => void
}

export function PatientList({ patients, onSelect, onAddNew }: Props) {
  const { search, setSearch, sort, setSort, resetFilters, isFilterActive, results } = usePatientQuery(patients)
  const { preferences } = usePreferences()

  return (
    <div className="flex flex-col gap-3">
      <ScreenHeader
        title="Patients"
        action={
          <Button variant="primary" onClick={onAddNew}>
            Add new patient
          </Button>
        }
      />

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={`Name or number (${MIN_SEARCH_LENGTH}+ chars)`}
        filter={{
          active: isFilterActive,
          onReset: resetFilters,
          content: (
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Sort</span>
              <Select value={sort} onChange={(e) => setSort(e.target.value as PatientSort)}>
                <option value="default">Newest first</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </Select>
            </label>
          ),
        }}
      />

      <ListView
        items={results}
        getKey={(patient) => patient.id}
        pageSize={preferences.listPageSize}
        itemLabel="patient"
        emptyMessage={patients.length === 0 ? 'No patients yet. Add the first one.' : 'No patients match.'}
        renderItem={(patient) => {
          const age = getPatientAge(patient)
          return (
            <Button
              variant="unstyled"
              className={cx(cardBase, 'flex w-full flex-col gap-1 text-left cursor-pointer')}
              onClick={() => onSelect(patient.id)}
            >
              <span className="font-semibold text-text-h">{patient.name}</span>
              <span className="text-[13px] capitalize text-text">
                {patient.patientNumber} · {age != null ? `${age} yrs` : 'Age unknown'} ·{' '}
                {patient.gender === 'unspecified' ? 'Gender unspecified' : patient.gender}
              </span>
            </Button>
          )
        }}
      />
    </div>
  )
}

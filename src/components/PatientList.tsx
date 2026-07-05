import type { Patient } from '../types'
import { getPatientAge } from '../utils/age'

interface Props {
  patients: Patient[]
  onSelect: (id: string) => void
}

export function PatientList({ patients, onSelect }: Props) {
  if (patients.length === 0) {
    return <p className="empty-state">No patients yet. Add the first one.</p>
  }

  return (
    <ul className="patient-list">
      {patients.map((patient) => {
        const age = getPatientAge(patient)
        return (
          <li key={patient.id}>
            <button className="patient-card" onClick={() => onSelect(patient.id)}>
              <span className="patient-name">{patient.name}</span>
              <span className="patient-meta">
                {age != null ? `${age} yrs` : 'Age unknown'} ·{' '}
                {patient.gender === 'unspecified' ? 'Gender unspecified' : patient.gender}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

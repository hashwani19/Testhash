import type { EyeRecord, Patient } from '../types'
import { getPatientAge } from '../utils/age'
import { EyeRecordHistory } from './EyeRecordHistory'

interface Props {
  patient: Patient
  records: EyeRecord[]
  onEdit: () => void
  onDelete: () => void
  onAddRecord: () => void
  onDeleteRecord: (id: string) => void
  onBack: () => void
}

export function PatientDetail({
  patient,
  records,
  onEdit,
  onDelete,
  onAddRecord,
  onDeleteRecord,
  onBack,
}: Props) {
  const age = getPatientAge(patient)

  return (
    <div className="patient-detail">
      <button className="btn-link" onClick={onBack}>
        ‹ All patients
      </button>

      <div className="patient-summary">
        <h2>{patient.name}</h2>
        <dl className="patient-facts">
          <div>
            <dt>Age</dt>
            <dd>{age != null ? `${age} years` : 'Unknown'}</dd>
          </div>
          <div>
            <dt>Date of birth</dt>
            <dd>{patient.dob || 'Not provided'}</dd>
          </div>
          <div>
            <dt>Gender</dt>
            <dd>{patient.gender === 'unspecified' ? 'Unspecified' : patient.gender}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{patient.address || 'Not provided'}</dd>
          </div>
        </dl>
        <div className="form-actions">
          <button className="btn-secondary" onClick={onEdit}>
            Edit patient
          </button>
          <button className="btn-danger" onClick={onDelete}>
            Delete patient
          </button>
        </div>
      </div>

      <div className="section-header">
        <h3>Eye treatment history</h3>
        <button className="btn-primary" onClick={onAddRecord}>
          Add record
        </button>
      </div>

      <EyeRecordHistory records={records} onDelete={onDeleteRecord} />
    </div>
  )
}

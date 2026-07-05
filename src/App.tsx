import { useState } from 'react'
import { usePatients } from './hooks/usePatients'
import { useEyeRecords } from './hooks/useEyeRecords'
import { PatientList } from './components/PatientList'
import { PatientForm } from './components/PatientForm'
import { PatientDetail } from './components/PatientDetail'
import { EyeRecordForm } from './components/EyeRecordForm'
import { OfflineBanner } from './components/OfflineBanner'
import { InstallBanner } from './components/InstallBanner'
import './App.css'

type View = 'list' | 'newPatient' | 'editPatient' | 'patientDetail' | 'newRecord'

function App() {
  const { patients, addPatient, updatePatient, deletePatient } = usePatients()
  const { addRecord, deleteRecord, deleteRecordsForPatient, getRecordsForPatient } =
    useEyeRecords()

  const [view, setView] = useState<View>('list')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null

  const goToList = () => {
    setSelectedPatientId(null)
    setView('list')
  }

  return (
    <div className="app">
      <OfflineBanner />
      <InstallBanner />

      <header className="app-header">
        <h1>Eye Care Records</h1>
        <p className="subtitle">
          {patients.length === 0
            ? 'No patients yet'
            : `${patients.length} patient${patients.length === 1 ? '' : 's'}`}
        </p>
      </header>

      <main className="app-main">
        {view === 'list' && (
          <>
            <button className="btn-primary btn-block" onClick={() => setView('newPatient')}>
              Add patient
            </button>
            <PatientList
              patients={patients}
              onSelect={(id) => {
                setSelectedPatientId(id)
                setView('patientDetail')
              }}
            />
          </>
        )}

        {view === 'newPatient' && (
          <PatientForm
            onSubmit={(input) => {
              const id = addPatient(input)
              setSelectedPatientId(id)
              setView('patientDetail')
            }}
            onCancel={goToList}
          />
        )}

        {view === 'editPatient' && selectedPatient && (
          <PatientForm
            initial={selectedPatient}
            onSubmit={(input) => {
              updatePatient(selectedPatient.id, input)
              setView('patientDetail')
            }}
            onCancel={() => setView('patientDetail')}
          />
        )}

        {view === 'patientDetail' && selectedPatient && (
          <PatientDetail
            patient={selectedPatient}
            records={getRecordsForPatient(selectedPatient.id)}
            onEdit={() => setView('editPatient')}
            onDelete={() => {
              if (!confirm(`Delete ${selectedPatient.name} and all their records?`)) return
              deleteRecordsForPatient(selectedPatient.id)
              deletePatient(selectedPatient.id)
              goToList()
            }}
            onAddRecord={() => setView('newRecord')}
            onDeleteRecord={(id) => {
              if (!confirm('Delete this record?')) return
              deleteRecord(id)
            }}
            onBack={goToList}
          />
        )}

        {view === 'newRecord' && selectedPatient && (
          <EyeRecordForm
            onSubmit={(input) => {
              addRecord(selectedPatient.id, input)
              setView('patientDetail')
            }}
            onCancel={() => setView('patientDetail')}
          />
        )}
      </main>
    </div>
  )
}

export default App

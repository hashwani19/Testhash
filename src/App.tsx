import { useState } from 'react'
import { AuthProvider } from './auth/AuthContext'
import { useAuth } from './hooks/useAuth'
import { usePatients } from './hooks/usePatients'
import { useEyeVisits } from './hooks/useEyeVisits'
import { usePatientGroups } from './hooks/usePatientGroups'
import { PatientList } from './components/PatientList'
import { PatientForm } from './components/PatientForm'
import { PatientDetail } from './components/PatientDetail'
import { EyeRecordForm } from './components/EyeRecordForm'
import { ManageGroupsScreen } from './components/ManageGroupsScreen'
import { LoginScreen } from './components/LoginScreen'
import { OfflineBanner } from './components/OfflineBanner'
import { InstallBanner } from './components/InstallBanner'
import './App.css'

type View = 'list' | 'newPatient' | 'editPatient' | 'patientDetail' | 'newRecord' | 'manageGroups'

function AppShell() {
  const { user, logout } = useAuth()
  const { patients, addPatient, updatePatient, deletePatient } = usePatients()
  const { addVisit, deleteVisit, deleteVisitsForPatient, getVisitsForPatient } = useEyeVisits()
  const { groups, addGroup, renameGroup, deleteGroup } = usePatientGroups()

  const [view, setView] = useState<View>('list')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  if (!user) return <LoginScreen />

  const isAdmin = user.role === 'admin'
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
        <div className="app-header-row">
          <h1>Eye Care Records</h1>
          <div className="app-header-user">
            <span>
              {user.fullName} <span className="role-badge">{user.role}</span>
            </span>
            <button className="btn-link" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
        <p className="subtitle">
          {patients.length === 0
            ? 'No patients yet'
            : `${patients.length} patient${patients.length === 1 ? '' : 's'}`}
          {isAdmin && (
            <>
              {' · '}
              <button className="btn-link" onClick={() => setView('manageGroups')}>
                Manage groups
              </button>
            </>
          )}
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
              groups={groups}
              onSelect={(id) => {
                setSelectedPatientId(id)
                setView('patientDetail')
              }}
            />
          </>
        )}

        {view === 'newPatient' && (
          <PatientForm
            groups={groups}
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
            groups={groups}
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
            groups={groups}
            visits={getVisitsForPatient(selectedPatient.id)}
            canDeleteRecords={isAdmin}
            canDeletePatient={isAdmin}
            onEdit={() => setView('editPatient')}
            onDelete={() => {
              if (!confirm(`Delete ${selectedPatient.name} and all their records?`)) return
              deleteVisitsForPatient(selectedPatient.id)
              deletePatient(selectedPatient.id)
              goToList()
            }}
            onAddRecord={() => setView('newRecord')}
            onDeleteRecord={(id) => {
              if (!confirm('Delete this record?')) return
              deleteVisit(id)
            }}
            onBack={goToList}
          />
        )}

        {view === 'newRecord' && selectedPatient && (
          <EyeRecordForm
            onSubmit={(input) => {
              addVisit(selectedPatient.id, input)
              setView('patientDetail')
            }}
            onCancel={() => setView('patientDetail')}
          />
        )}

        {view === 'manageGroups' && isAdmin && (
          <ManageGroupsScreen
            groups={groups}
            patients={patients}
            onAdd={addGroup}
            onRename={renameGroup}
            onDelete={deleteGroup}
            onBack={goToList}
          />
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App

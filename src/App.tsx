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
import { btnLink, btnPrimary } from './styles'
import type { EyeVisit } from './types'

type View =
  | 'list'
  | 'newPatient'
  | 'editPatient'
  | 'patientDetail'
  | 'newRecord'
  | 'editRecord'
  | 'manageGroups'

function AppShell() {
  const { user, logout } = useAuth()
  const { patients, addPatient, updatePatient, deletePatient } = usePatients()
  const { addVisit, updateVisit, deleteVisit, deleteVisitsForPatient, getVisitsForPatient } =
    useEyeVisits()
  const { groups, addGroup, renameGroup, deleteGroup } = usePatientGroups()

  const [view, setView] = useState<View>('list')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [editingVisit, setEditingVisit] = useState<EyeVisit | null>(null)

  if (!user) return <LoginScreen />

  const isAdmin = user.role === 'admin'
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null

  const goToList = () => {
    setSelectedPatientId(null)
    setEditingVisit(null)
    setView('list')
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-[560px] flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]">
      <OfflineBanner />
      <InstallBanner />

      <header className="px-5 pt-7 pb-2">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[28px] font-bold tracking-[-0.4px] text-text-h">Ortho and Vision Care</h1>
          <div className="flex items-center gap-2.5 text-[13px] text-text">
            <span>
              {user.fullName}{' '}
              <span className="rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] capitalize">
                {user.role}
              </span>
            </span>
            <button className={btnLink} onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-text">
          {patients.length === 0
            ? 'No patients yet'
            : `${patients.length} patient${patients.length === 1 ? '' : 's'}`}
          {isAdmin && (
            <>
              {' · '}
              <button className={btnLink} onClick={() => setView('manageGroups')}>
                Manage groups
              </button>
            </>
          )}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-5 pb-10 pt-3">
        {view === 'list' && (
          <>
            <button className={`${btnPrimary} w-full`} onClick={() => setView('newPatient')}>
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
              deleteVisitsForPatient(selectedPatient.id)
              deletePatient(selectedPatient.id)
              goToList()
            }}
            onAddRecord={() => setView('newRecord')}
            onEditRecord={(visit) => {
              setEditingVisit(visit)
              setView('editRecord')
            }}
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
              if (addVisit(selectedPatient.id, input)) setView('patientDetail')
            }}
            onCancel={() => setView('patientDetail')}
          />
        )}

        {view === 'editRecord' && selectedPatient && editingVisit && (
          <EyeRecordForm
            initial={editingVisit}
            onSubmit={(input) => {
              if (updateVisit(editingVisit.id, input)) {
                setEditingVisit(null)
                setView('patientDetail')
              }
            }}
            onCancel={() => {
              setEditingVisit(null)
              setView('patientDetail')
            }}
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

import { useState } from 'react'
import { AuthProvider } from './auth/AuthContext'
import { PreferencesProvider } from './preferences/PreferencesProvider'
import { GlobalSettingsProvider } from './settings/GlobalSettingsProvider'
import { AuditLogProvider } from './auditLog/AuditLogProvider'
import { useAuth } from './hooks/useAuth'
import { usePatients } from './hooks/usePatients'
import { useEyeVisits } from './hooks/useEyeVisits'
import { usePatientGroups } from './hooks/usePatientGroups'
import { useAppointments } from './hooks/useAppointments'
import { useAuditLog } from './hooks/useAuditLog'
import { usePreferences } from './hooks/usePreferences'
import { useThemeEffect } from './hooks/useThemeEffect'
import { PatientList } from './components/PatientList'
import { PatientForm } from './components/PatientForm'
import { PatientDetail } from './components/PatientDetail'
import { EyeRecordForm } from './components/EyeRecordForm'
import { ManageGroupsScreen } from './components/ManageGroupsScreen'
import { ActivityScreen } from './components/ActivityScreen'
import { PreferencesScreen } from './components/PreferencesScreen'
import { AppointmentsScreen } from './components/AppointmentsScreen'
import { AppointmentForm } from './components/AppointmentForm'
import { AppHeader } from './components/AppHeader'
import type { NavTarget } from './components/NavMenu'
import { ConfirmModal } from './components/ConfirmModal'
import { LoginScreen } from './components/LoginScreen'
import { OfflineBanner } from './components/OfflineBanner'
import { InstallBanner } from './components/InstallBanner'
import { Button } from './components/common/Button'
import type { Appointment, EyeVisit, Patient } from './types'

type View =
  | 'list'
  | 'newPatient'
  | 'editPatient'
  | 'patientDetail'
  | 'newRecord'
  | 'editRecord'
  | 'manageGroups'
  | 'activity'
  | 'appointments'
  | 'newAppointment'
  | 'editAppointment'
  | 'preferences'

const VIEW_TO_NAV_TARGET: Partial<Record<View, NavTarget>> = {
  manageGroups: 'groups',
  activity: 'activity',
  appointments: 'appointments',
  newAppointment: 'appointments',
  editAppointment: 'appointments',
}

function AppShell() {
  const { user, users, logout } = useAuth()
  const { patients, addPatient, updatePatient, deletePatient } = usePatients()
  const { addVisit, updateVisit, deleteVisit, deleteVisitsForPatient, getVisitsForPatient } =
    useEyeVisits(patients)
  const { groups, addGroup, renameGroup, deleteGroup } = usePatientGroups()
  const {
    appointments,
    addAppointment,
    linkAppointmentToPatient,
    updateAppointment,
    deleteAppointment,
    deleteAppointments,
  } = useAppointments(patients)
  const { entries } = useAuditLog()
  const { preferences } = usePreferences()
  useThemeEffect(preferences.theme)

  const [view, setView] = useState<View>('list')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [editingVisit, setEditingVisit] = useState<EyeVisit | null>(null)
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
  // Set when "Add patient" is used on a new-patient appointment — prefills
  // the patient form with the details captured at booking time, and once
  // submitted, links the appointment to the newly created patient.
  const [newPatientPrefill, setNewPatientPrefill] = useState<Partial<Patient> | null>(null)
  const [linkAppointmentId, setLinkAppointmentId] = useState<string | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  if (!user) return <LoginScreen />

  const isAdmin = user.role === 'admin'
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null

  const goToList = () => {
    setSelectedPatientId(null)
    setEditingVisit(null)
    setView('list')
  }

  const navigateTo = (target: NavTarget) => {
    setSelectedPatientId(null)
    setEditingVisit(null)
    setNewPatientPrefill(null)
    setLinkAppointmentId(null)
    setEditingAppointment(null)
    if (target === 'patients') setView('list')
    else if (target === 'groups') setView('manageGroups')
    else if (target === 'activity') setView('activity')
    else if (target === 'appointments') setView('appointments')
  }

  const requestSignOut = () => setConfirmingSignOut(true)

  return (
    <div className="mx-auto flex min-h-svh max-w-[560px] flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]">
      <OfflineBanner />
      <InstallBanner />

      <AppHeader
        fullName={user.fullName}
        role={user.role}
        activeNavTarget={VIEW_TO_NAV_TARGET[view] ?? 'patients'}
        onNavigate={navigateTo}
        onOpenPreferences={() => setView('preferences')}
        onSignOut={requestSignOut}
      />

      {confirmingSignOut && (
        <ConfirmModal
          title="Sign out?"
          warning="You'll need to sign back in to view or edit patient records."
          mode="yesNo"
          confirmLabel="Sign out"
          onConfirm={() => {
            setConfirmingSignOut(false)
            logout()
          }}
          onCancel={() => setConfirmingSignOut(false)}
        />
      )}

      <main className="flex flex-1 flex-col gap-4 px-5 pb-10 pt-3">
        {view === 'list' && (
          <>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setNewPatientPrefill(null)
                setLinkAppointmentId(null)
                setView('newPatient')
              }}
            >
              Add patient
            </Button>
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
            initial={newPatientPrefill ?? undefined}
            groups={groups}
            onSubmit={(input) => {
              const id = addPatient(input)
              if (linkAppointmentId) linkAppointmentToPatient(linkAppointmentId, id)
              setNewPatientPrefill(null)
              setLinkAppointmentId(null)
              setSelectedPatientId(id)
              setView('patientDetail')
            }}
            onCancel={() => {
              setNewPatientPrefill(null)
              setLinkAppointmentId(null)
              goToList()
            }}
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
            onDeleteRecord={deleteVisit}
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

        {view === 'activity' && isAdmin && (
          <ActivityScreen entries={entries} users={users} onBack={goToList} />
        )}

        {view === 'appointments' && (
          <>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setEditingAppointment(null)
                setView('newAppointment')
              }}
            >
              Add appointment
            </Button>
            <AppointmentsScreen
              appointments={appointments}
              patients={patients}
              isAdmin={isAdmin}
              onAddAsPatient={(appointment) => {
                setNewPatientPrefill({
                  name: appointment.name,
                  dob: appointment.dob,
                  manualAge: appointment.manualAge,
                  mobile: appointment.mobile,
                  address: appointment.address,
                })
                setLinkAppointmentId(appointment.id)
                setView('newPatient')
              }}
              onAddVisit={(appointment) => {
                if (!appointment.patientId) return
                setSelectedPatientId(appointment.patientId)
                setView('newRecord')
              }}
              onEdit={(appointment) => {
                setEditingAppointment(appointment)
                setView('editAppointment')
              }}
              onDelete={deleteAppointment}
              onBulkDelete={deleteAppointments}
            />
          </>
        )}

        {view === 'newAppointment' && (
          <AppointmentForm
            patients={patients}
            onSubmit={(input) => {
              addAppointment(input)
              setView('appointments')
            }}
            onCancel={() => setView('appointments')}
          />
        )}

        {view === 'editAppointment' && editingAppointment && (
          <AppointmentForm
            patients={patients}
            initial={editingAppointment}
            onSubmit={(input) => {
              updateAppointment(editingAppointment.id, input)
              setEditingAppointment(null)
              setView('appointments')
            }}
            onCancel={() => {
              setEditingAppointment(null)
              setView('appointments')
            }}
          />
        )}

        {view === 'preferences' && <PreferencesScreen onBack={goToList} />}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuditLogProvider>
        <GlobalSettingsProvider>
          <PreferencesProvider>
            <AppShell />
          </PreferencesProvider>
        </GlobalSettingsProvider>
      </AuditLogProvider>
    </AuthProvider>
  )
}

export default App

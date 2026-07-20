import { useState } from 'react'
import { AuthProvider } from './auth/AuthContext'
import { PreferencesProvider } from './preferences/PreferencesProvider'
import { GlobalSettingsProvider } from './settings/GlobalSettingsProvider'
import { PrescriptionTemplateProvider } from './settings/PrescriptionTemplateProvider'
import { AuditLogProvider } from './auditLog/AuditLogProvider'
import { useAuth } from './hooks/useAuth'
import { usePatients } from './hooks/usePatients'
import { useEyeVisits } from './hooks/useEyeVisits'
import { usePatientGroups } from './hooks/usePatientGroups'
import { useAppointments } from './hooks/useAppointments'
import { useAuditLog } from './hooks/useAuditLog'
import { useAttachments } from './hooks/useAttachments'
import { usePreferences } from './hooks/usePreferences'
import { usePrescriptionTemplate } from './hooks/usePrescriptionTemplate'
import { useThemeEffect } from './hooks/useThemeEffect'
import { PLATFORM_NAME } from './branding'
import { PatientList } from './components/PatientList'
import { PatientForm } from './components/PatientForm'
import { PatientDetail } from './components/PatientDetail'
import { EyeRecordForm } from './components/EyeRecordForm'
import { ManageGroupsScreen } from './components/ManageGroupsScreen'
import { ActivityScreen } from './components/ActivityScreen'
import { PreferencesScreen } from './components/PreferencesScreen'
import { AppointmentsScreen } from './components/AppointmentsScreen'
import { AppointmentForm } from './components/AppointmentForm'
import { AnalyticsScreen } from './components/AnalyticsScreen'
import { AppHeader } from './components/AppHeader'
import { NavRail } from './components/NavRail'
import type { NavTarget } from './nav'
import { ConfirmModal } from './components/ConfirmModal'
import { AuthScreen } from './components/AuthScreen'
import { SuperUserShell } from './components/SuperUserShell'
import { UsersScreen } from './components/UsersScreen'
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
  | 'analytics'
  | 'users'
  | 'preferences'

const VIEW_TO_NAV_TARGET: Partial<Record<View, NavTarget>> = {
  manageGroups: 'groups',
  activity: 'activity',
  appointments: 'appointments',
  newAppointment: 'appointments',
  editAppointment: 'appointments',
  analytics: 'analytics',
  users: 'users',
}

function AppShell() {
  const { user, users, tenants, logout } = useAuth()
  const clinicType = tenants.find((t) => t.id === user?.tenantId)?.clinicType ?? 'ophthalmology'
  const { patients, addPatient, updatePatient, deletePatient } = usePatients()
  const { visits, addVisit, updateVisit, deleteVisit, deleteVisitsForPatient, getVisitsForPatient } =
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
  const { attachments, addAttachments, deleteAttachment, deleteAttachmentsForVisits, getAttachmentsForVisit } =
    useAttachments()
  const { preferences } = usePreferences()
  const { template } = usePrescriptionTemplate()
  // Clinic name is mandatory going forward (SignUpScreen/TenantForm,
  // PreferencesScreen) — this fallback only ever matters for the
  // pre-existing default tenant's template, which already gets one from
  // PrescriptionTemplateProvider's own DEFAULT_TEMPLATE.
  const title = template.clinicName?.trim() || PLATFORM_NAME
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

  if (!user) return null

  const isAdmin = user.roles.includes('admin')
  const isDoctor = user.roles.includes('doctor')
  // Attachments aren't rendered at all for a user who is only front_desk
  // (§8.4/§8.5 of docs/design.md) — holding admin or doctor as one of
  // possibly several roles is enough to grant it.
  const canManageAttachments = isAdmin || isDoctor
  // Analytics is clinic-wide, aggregate data — admin + doctor, not front_desk (§5.7).
  const canViewAnalytics = isAdmin || isDoctor
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
    else if (target === 'analytics') setView('analytics')
    else if (target === 'users') setView('users')
  }

  const requestSignOut = () => setConfirmingSignOut(true)

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[560px] flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] md:max-w-[1440px] md:flex-row">
      <NavRail
        title={title}
        roles={user.roles}
        active={VIEW_TO_NAV_TARGET[view] ?? 'patients'}
        onNavigate={navigateTo}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <InstallBanner />

        <AppHeader
          title={title}
          fullName={user.fullName}
          roles={user.roles}
          activeNavTarget={VIEW_TO_NAV_TARGET[view] ?? 'patients'}
          onNavigate={navigateTo}
          onOpenPreferences={isAdmin ? () => setView('preferences') : undefined}
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

        <main className="flex flex-1 flex-col gap-4 px-5 pb-10 pt-3 md:px-8 md:pt-[26px] lg:px-10">
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
              Add new patient
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
            clinicType={clinicType}
            canDeleteRecords={isAdmin}
            canDeletePatient={isAdmin}
            canViewAttachments={canManageAttachments}
            attachments={attachments}
            onEdit={() => setView('editPatient')}
            onDelete={() => {
              const patientVisitIds = getVisitsForPatient(selectedPatient.id).map((v) => v.id)
              deleteAttachmentsForVisits(patientVisitIds)
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
              deleteAttachmentsForVisits([id])
              deleteVisit(id)
            }}
            onBack={goToList}
          />
        )}

        {view === 'newRecord' && selectedPatient && (
          <EyeRecordForm
            clinicType={clinicType}
            canManageAttachments={canManageAttachments}
            canDeleteAttachments={isAdmin}
            attachments={[]}
            onDeleteAttachment={deleteAttachment}
            onSubmit={(input, newAttachments) => {
              const id = addVisit(selectedPatient.id, input, newAttachments.length > 0)
              if (id) {
                if (newAttachments.length > 0) addAttachments(id, newAttachments)
                setView('patientDetail')
              }
            }}
            onCancel={() => setView('patientDetail')}
          />
        )}

        {view === 'editRecord' && selectedPatient && editingVisit && (
          <EyeRecordForm
            initial={editingVisit}
            clinicType={clinicType}
            canManageAttachments={canManageAttachments}
            canDeleteAttachments={isAdmin}
            attachments={getAttachmentsForVisit(editingVisit.id)}
            onDeleteAttachment={deleteAttachment}
            onSubmit={(input, newAttachments) => {
              const hasAttachments =
                newAttachments.length > 0 || getAttachmentsForVisit(editingVisit.id).length > 0
              if (updateVisit(editingVisit.id, input, hasAttachments)) {
                if (newAttachments.length > 0) addAttachments(editingVisit.id, newAttachments)
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

        {view === 'analytics' && canViewAnalytics && (
          <AnalyticsScreen patients={patients} visits={visits} onBack={goToList} />
        )}

        {view === 'users' && isAdmin && <UsersScreen onBack={goToList} />}

        {view === 'preferences' && isAdmin && <PreferencesScreen onBack={goToList} />}
        </main>
      </div>
    </div>
  )
}

/**
 * Branches on auth state before any tenant-scoped provider mounts (§5.5 of
 * docs/design.md): signed out gets the sign-in/signup screen, the fixed
 * superuser account gets its own minimal shell with none of the per-clinic
 * providers (patients, appointments, prescription template, ...) mounted,
 * and every tenant-scoped role gets the full app.
 */
function AuthGate() {
  const { user } = useAuth()

  if (!user) return <AuthScreen />
  if (user.roles.includes('super_user')) return <SuperUserShell />

  return (
    <AuditLogProvider>
      <GlobalSettingsProvider>
        <PrescriptionTemplateProvider>
          <PreferencesProvider>
            <AppShell />
          </PreferencesProvider>
        </PrescriptionTemplateProvider>
      </GlobalSettingsProvider>
    </AuditLogProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App

import type { EyeVisit, Patient, PatientGroup } from './types'

// Sample data for a fresh install of this local-only test build — lets you
// explore search/filter/sort/history without manually typing in patients
// first. Only used the very first time each localStorage key is empty; real
// data always takes over once you start adding/editing anything.

const DAY = 24 * 60 * 60 * 1000

export const SEED_GROUPS: PatientGroup[] = [
  { id: 'seed-group-family', name: 'Family', createdAt: Date.now() - 40 * DAY, updatedAt: Date.now() - 40 * DAY },
  { id: 'seed-group-friends', name: 'Friends', createdAt: Date.now() - 38 * DAY, updatedAt: Date.now() - 38 * DAY },
]

export const SEED_PATIENTS: Patient[] = [
  {
    id: 'seed-patient-priya',
    patientNumber: 'P-20260601-0001',
    name: 'Priya Sharma',
    dob: '1988-04-12',
    address: '12 MG Road, Agra',
    gender: 'female',
    groupId: 'seed-group-family',
    createdAt: Date.now() - 34 * DAY,
    updatedAt: Date.now() - 34 * DAY,
  },
  {
    id: 'seed-patient-rohan',
    patientNumber: 'P-20260605-0001',
    name: 'Rohan Verma',
    dob: '1995-09-03',
    gender: 'male',
    groupId: 'seed-group-friends',
    createdAt: Date.now() - 30 * DAY,
    updatedAt: Date.now() - 30 * DAY,
  },
  {
    id: 'seed-patient-anjali',
    patientNumber: 'P-20260610-0001',
    name: 'Anjali Gupta',
    manualAge: 62,
    address: '4 Civil Lines, Agra',
    gender: 'female',
    groupId: 'seed-group-family',
    createdAt: Date.now() - 25 * DAY,
    updatedAt: Date.now() - 25 * DAY,
  },
  {
    id: 'seed-patient-karan',
    patientNumber: 'P-20260615-0001',
    name: 'Karan Mehta',
    dob: '1975-01-20',
    gender: 'male',
    createdAt: Date.now() - 20 * DAY,
    updatedAt: Date.now() - 20 * DAY,
  },
  {
    id: 'seed-patient-sunita',
    patientNumber: 'P-20260620-0001',
    name: 'Sunita Devi',
    manualAge: 45,
    gender: 'female',
    groupId: 'seed-group-friends',
    createdAt: Date.now() - 15 * DAY,
    updatedAt: Date.now() - 15 * DAY,
  },
]

export const SEED_VISITS: EyeVisit[] = [
  // Priya Sharma: two visits, mild myopia progressing slightly.
  {
    id: 'seed-visit-priya-1',
    patientId: 'seed-patient-priya',
    visitAt: new Date(Date.now() - 34 * DAY).toISOString(),
    refractions: {
      left: { distance: { sphere: -1.0, cylinder: -0.25, axis: 90, visualAcuity: '6/6' }, reading: {} },
      right: { distance: { sphere: -1.25, cylinder: -0.25, axis: 85, visualAcuity: '6/6' }, reading: {} },
    },
    lenses: 'Single vision, anti-glare',
    diagnosis: 'Mild myopia',
    treatmentPlan: 'Review in 6 months',
    createdAt: Date.now() - 34 * DAY,
    updatedAt: Date.now() - 34 * DAY,
  },
  {
    id: 'seed-visit-priya-2',
    patientId: 'seed-patient-priya',
    visitAt: new Date(Date.now() - 4 * DAY).toISOString(),
    refractions: {
      left: { distance: { sphere: -1.25, cylinder: -0.25, axis: 90, visualAcuity: '6/6' }, reading: {} },
      right: { distance: { sphere: -1.5, cylinder: -0.25, axis: 85, visualAcuity: '6/6' }, reading: {} },
    },
    lenses: 'Single vision, anti-glare',
    diagnosis: 'Mild myopia, slight progression',
    treatmentPlan: 'Updated prescription; review in 1 year',
    createdAt: Date.now() - 4 * DAY,
    updatedAt: Date.now() - 4 * DAY,
  },
  // Rohan Verma: one visit.
  {
    id: 'seed-visit-rohan-1',
    patientId: 'seed-patient-rohan',
    visitAt: new Date(Date.now() - 30 * DAY).toISOString(),
    refractions: {
      left: { distance: { visualAcuity: '6/6' }, reading: {} },
      right: { distance: { visualAcuity: '6/6' }, reading: {} },
    },
    diagnosis: 'Normal vision, routine checkup',
    createdAt: Date.now() - 30 * DAY,
    updatedAt: Date.now() - 30 * DAY,
  },
  // Karan Mehta: two visits, presbyopia with a reading prescription.
  {
    id: 'seed-visit-karan-1',
    patientId: 'seed-patient-karan',
    visitAt: new Date(Date.now() - 20 * DAY).toISOString(),
    refractions: {
      left: {
        distance: { sphere: 0.25, visualAcuity: '6/6' },
        reading: { sphere: 1.5, visualAcuity: 'N/6' },
      },
      right: {
        distance: { sphere: 0.25, visualAcuity: '6/6' },
        reading: { sphere: 1.5, visualAcuity: 'N/6' },
      },
    },
    lenses: 'Progressive',
    diagnosis: 'Presbyopia',
    createdAt: Date.now() - 20 * DAY,
    updatedAt: Date.now() - 20 * DAY,
  },
  {
    id: 'seed-visit-karan-2',
    patientId: 'seed-patient-karan',
    visitAt: new Date(Date.now() - 2 * DAY).toISOString(),
    refractions: {
      left: {
        distance: { sphere: 0.25, visualAcuity: '6/6' },
        reading: { sphere: 1.75, visualAcuity: 'N/6' },
      },
      right: {
        distance: { sphere: 0.25, visualAcuity: '6/6' },
        reading: { sphere: 1.75, visualAcuity: 'N/6' },
      },
    },
    lenses: 'Progressive',
    diagnosis: 'Presbyopia, reading power increased',
    treatmentPlan: 'Annual review',
    notes: 'Patient reports eye strain after long reading sessions',
    createdAt: Date.now() - 2 * DAY,
    updatedAt: Date.now() - 2 * DAY,
  },
  // Anjali Gupta and Sunita Devi: no visits yet, to show the empty-history state too.
]

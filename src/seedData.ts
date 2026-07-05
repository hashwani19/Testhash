import type { EyeVisit, Patient, PatientGroup } from './types'

// Sample data for a fresh install of this local-only test build — lets you
// explore search/filter/sort/history without manually typing in patients
// first. Only used the very first time each localStorage key is empty; real
// data always takes over once you start adding/editing anything.
//
// Nearly every patient has visit history (some with several visits showing
// a prescription changing over time); exactly one (Anjali Gupta) has none,
// so the empty-history state is still visible without deleting anything.

const DAY = 24 * 60 * 60 * 1000
const ago = (days: number) => Date.now() - days * DAY
const agoIso = (days: number) => new Date(ago(days)).toISOString()

export const SEED_GROUPS: PatientGroup[] = [
  { id: 'seed-group-family', name: 'Family', createdAt: ago(85), updatedAt: ago(85) },
  { id: 'seed-group-friends', name: 'Friends', createdAt: ago(83), updatedAt: ago(83) },
]

export const SEED_PATIENTS: Patient[] = [
  {
    id: 'seed-patient-vikram',
    patientNumber: 'P-20260415-0001',
    name: 'Vikram Singh',
    dob: '1960-11-02',
    address: '7 Sadar Bazaar, Agra',
    gender: 'male',
    createdAt: ago(81),
    updatedAt: ago(81),
  },
  {
    id: 'seed-patient-deepa',
    patientNumber: 'P-20260420-0001',
    name: 'Deepa Nair',
    dob: '1970-06-18',
    gender: 'female',
    createdAt: ago(76),
    updatedAt: ago(76),
  },
  {
    id: 'seed-patient-neha',
    patientNumber: 'P-20260510-0001',
    name: 'Neha Kapoor',
    dob: '2015-03-22',
    address: '21 Shastripuram, Agra',
    gender: 'female',
    groupId: 'seed-group-family',
    createdAt: ago(56),
    updatedAt: ago(56),
  },
  {
    id: 'seed-patient-priya',
    patientNumber: 'P-20260601-0001',
    name: 'Priya Sharma',
    dob: '1988-04-12',
    address: '12 MG Road, Agra',
    gender: 'female',
    groupId: 'seed-group-family',
    createdAt: ago(34),
    updatedAt: ago(34),
  },
  {
    id: 'seed-patient-rohan',
    patientNumber: 'P-20260605-0001',
    name: 'Rohan Verma',
    dob: '1995-09-03',
    gender: 'male',
    groupId: 'seed-group-friends',
    createdAt: ago(30),
    updatedAt: ago(30),
  },
  {
    id: 'seed-patient-anjali',
    patientNumber: 'P-20260610-0001',
    name: 'Anjali Gupta',
    manualAge: 62,
    address: '4 Civil Lines, Agra',
    gender: 'female',
    groupId: 'seed-group-family',
    createdAt: ago(25),
    updatedAt: ago(25),
  },
  {
    id: 'seed-patient-karan',
    patientNumber: 'P-20260615-0001',
    name: 'Karan Mehta',
    dob: '1975-01-20',
    gender: 'male',
    createdAt: ago(20),
    updatedAt: ago(20),
  },
  {
    id: 'seed-patient-sunita',
    patientNumber: 'P-20260620-0001',
    name: 'Sunita Devi',
    manualAge: 45,
    gender: 'female',
    groupId: 'seed-group-friends',
    createdAt: ago(15),
    updatedAt: ago(15),
  },
  {
    id: 'seed-patient-amit',
    patientNumber: 'P-20260625-0001',
    name: 'Amit Joshi',
    manualAge: 33,
    gender: 'male',
    groupId: 'seed-group-friends',
    createdAt: ago(10),
    updatedAt: ago(10),
  },
]

export const SEED_VISITS: EyeVisit[] = [
  // Vikram Singh — early cataract, monitored over time, glare at night.
  {
    id: 'seed-visit-vikram-1',
    patientId: 'seed-patient-vikram',
    visitAt: agoIso(75),
    refractions: {
      left: {
        distance: { sphere: 0.75, cylinder: -0.5, axis: 100, visualAcuity: '6/9' },
        reading: { sphere: 2.0, visualAcuity: 'N/8' },
      },
      right: {
        distance: { sphere: 1.0, cylinder: -0.75, axis: 95, visualAcuity: '6/9' },
        reading: { sphere: 2.0, visualAcuity: 'N/8' },
      },
    },
    lenses: 'Progressive',
    diagnosis: 'Early cataract, both eyes; presbyopia',
    treatmentPlan: 'Monitor cataract progression; review in 6 months',
    createdAt: ago(75),
    updatedAt: ago(75),
  },
  {
    id: 'seed-visit-vikram-2',
    patientId: 'seed-patient-vikram',
    visitAt: agoIso(12),
    refractions: {
      left: {
        distance: { sphere: 0.75, cylinder: -0.5, axis: 100, visualAcuity: '6/12' },
        reading: { sphere: 2.0, visualAcuity: 'N/10' },
      },
      right: {
        distance: { sphere: 1.0, cylinder: -0.75, axis: 95, visualAcuity: '6/9' },
        reading: { sphere: 2.0, visualAcuity: 'N/8' },
      },
    },
    lenses: 'Progressive',
    diagnosis: 'Cataract progressing, left eye more affected',
    treatmentPlan: 'Referral for cataract surgery evaluation',
    notes: 'Patient reports increased glare at night while driving',
    createdAt: ago(12),
    updatedAt: ago(12),
  },

  // Deepa Nair — hyperopia with presbyopia, stable progressive-lens wearer.
  {
    id: 'seed-visit-deepa-1',
    patientId: 'seed-patient-deepa',
    visitAt: agoIso(70),
    refractions: {
      left: {
        distance: { sphere: 1.25, visualAcuity: '6/6' },
        reading: { sphere: 2.25, visualAcuity: 'N/6' },
      },
      right: {
        distance: { sphere: 1.5, visualAcuity: '6/6' },
        reading: { sphere: 2.5, visualAcuity: 'N/6' },
      },
    },
    lenses: 'Progressive, anti-reflective coating',
    diagnosis: 'Hyperopia with presbyopia',
    treatmentPlan: 'Review in 1 year',
    createdAt: ago(70),
    updatedAt: ago(70),
  },
  {
    id: 'seed-visit-deepa-2',
    patientId: 'seed-patient-deepa',
    visitAt: agoIso(5),
    refractions: {
      left: {
        distance: { sphere: 1.25, visualAcuity: '6/6' },
        reading: { sphere: 2.75, visualAcuity: 'N/6' },
      },
      right: {
        distance: { sphere: 1.5, visualAcuity: '6/6' },
        reading: { sphere: 2.75, visualAcuity: 'N/6' },
      },
    },
    lenses: 'Progressive, anti-reflective coating',
    diagnosis: 'Hyperopia stable; reading addition increased slightly',
    treatmentPlan: 'Annual review recommended',
    notes: 'Comfortable with current progressives',
    createdAt: ago(5),
    updatedAt: ago(5),
  },

  // Neha Kapoor — pediatric myopia, steadily progressing, three visits.
  {
    id: 'seed-visit-neha-1',
    patientId: 'seed-patient-neha',
    visitAt: agoIso(54),
    refractions: {
      left: { distance: { sphere: -0.5, cylinder: -0.25, axis: 10, visualAcuity: '6/9' }, reading: {} },
      right: { distance: { sphere: -0.75, cylinder: -0.25, axis: 175, visualAcuity: '6/9' }, reading: {} },
    },
    lenses: 'Single vision',
    diagnosis: 'Early-onset myopia',
    treatmentPlan: 'Recheck in 3 months given age and progression risk',
    createdAt: ago(54),
    updatedAt: ago(54),
  },
  {
    id: 'seed-visit-neha-2',
    patientId: 'seed-patient-neha',
    visitAt: agoIso(24),
    refractions: {
      left: { distance: { sphere: -0.75, cylinder: -0.25, axis: 10, visualAcuity: '6/6' }, reading: {} },
      right: { distance: { sphere: -1.0, cylinder: -0.25, axis: 175, visualAcuity: '6/6' }, reading: {} },
    },
    lenses: 'Single vision, myopia control coating',
    diagnosis: 'Myopia progressing as expected for age',
    treatmentPlan: 'Recheck in 3 months',
    createdAt: ago(24),
    updatedAt: ago(24),
  },
  {
    id: 'seed-visit-neha-3',
    patientId: 'seed-patient-neha',
    visitAt: agoIso(3),
    refractions: {
      left: { distance: { sphere: -1.0, cylinder: -0.25, axis: 10, visualAcuity: '6/6' }, reading: {} },
      right: { distance: { sphere: -1.25, cylinder: -0.25, axis: 175, visualAcuity: '6/6' }, reading: {} },
    },
    lenses: 'Single vision, myopia control coating',
    diagnosis: 'Myopia progressing as expected for age',
    treatmentPlan: 'Follow-up in 3 months',
    notes: 'Recommend increased outdoor time to help slow progression',
    createdAt: ago(3),
    updatedAt: ago(3),
  },

  // Priya Sharma — mild myopia, progression tracked over three visits, now stable.
  {
    id: 'seed-visit-priya-1',
    patientId: 'seed-patient-priya',
    visitAt: agoIso(34),
    refractions: {
      left: { distance: { sphere: -1.0, cylinder: -0.25, axis: 90, visualAcuity: '6/6' }, reading: {} },
      right: { distance: { sphere: -1.25, cylinder: -0.25, axis: 85, visualAcuity: '6/6' }, reading: {} },
    },
    lenses: 'Single vision, anti-glare',
    diagnosis: 'Mild myopia',
    treatmentPlan: 'Review in 6 months',
    createdAt: ago(34),
    updatedAt: ago(34),
  },
  {
    id: 'seed-visit-priya-2',
    patientId: 'seed-patient-priya',
    visitAt: agoIso(4),
    refractions: {
      left: { distance: { sphere: -1.25, cylinder: -0.25, axis: 90, visualAcuity: '6/6' }, reading: {} },
      right: { distance: { sphere: -1.5, cylinder: -0.25, axis: 85, visualAcuity: '6/6' }, reading: {} },
    },
    lenses: 'Single vision, anti-glare',
    diagnosis: 'Mild myopia, slight progression',
    treatmentPlan: 'Updated prescription; review in 1 year',
    createdAt: ago(4),
    updatedAt: ago(4),
  },
  {
    id: 'seed-visit-priya-3',
    patientId: 'seed-patient-priya',
    visitAt: agoIso(1),
    refractions: {
      left: { distance: { sphere: -1.25, cylinder: -0.25, axis: 90, visualAcuity: '6/6' }, reading: {} },
      right: { distance: { sphere: -1.5, cylinder: -0.25, axis: 85, visualAcuity: '6/6' }, reading: {} },
    },
    diagnosis: 'Stable myopia, no further progression',
    notes: 'Reassured; no change to prescription needed',
    createdAt: ago(1),
    updatedAt: ago(1),
  },

  // Rohan Verma — normal vision, routine annual checkup.
  {
    id: 'seed-visit-rohan-1',
    patientId: 'seed-patient-rohan',
    visitAt: agoIso(30),
    refractions: {
      left: { distance: { visualAcuity: '6/6' }, reading: {} },
      right: { distance: { visualAcuity: '6/6' }, reading: {} },
    },
    diagnosis: 'Normal vision, routine checkup',
    createdAt: ago(30),
    updatedAt: ago(30),
  },
  {
    id: 'seed-visit-rohan-2',
    patientId: 'seed-patient-rohan',
    visitAt: agoIso(3),
    refractions: {
      left: { distance: { visualAcuity: '6/6' }, reading: {} },
      right: { distance: { visualAcuity: '6/6' }, reading: {} },
    },
    diagnosis: 'Normal vision, unchanged',
    treatmentPlan: 'Annual review',
    createdAt: ago(3),
    updatedAt: ago(3),
  },

  // Karan Mehta — presbyopia, reading power increasing, mild astigmatism newly noted.
  {
    id: 'seed-visit-karan-1',
    patientId: 'seed-patient-karan',
    visitAt: agoIso(20),
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
    createdAt: ago(20),
    updatedAt: ago(20),
  },
  {
    id: 'seed-visit-karan-2',
    patientId: 'seed-patient-karan',
    visitAt: agoIso(2),
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
    createdAt: ago(2),
    updatedAt: ago(2),
  },
  {
    id: 'seed-visit-karan-3',
    patientId: 'seed-patient-karan',
    visitAt: agoIso(1),
    refractions: {
      left: {
        distance: { sphere: 0.25, cylinder: -0.25, axis: 20, visualAcuity: '6/6' },
        reading: { sphere: 1.75, visualAcuity: 'N/6' },
      },
      right: {
        distance: { sphere: 0.25, cylinder: -0.25, axis: 160, visualAcuity: '6/6' },
        reading: { sphere: 1.75, visualAcuity: 'N/6' },
      },
    },
    lenses: 'Progressive',
    diagnosis: 'Presbyopia stable; mild astigmatism newly noted, monitoring',
    treatmentPlan: 'Recheck astigmatism at next visit',
    createdAt: ago(1),
    updatedAt: ago(1),
  },

  // Sunita Devi — mild hyperopia, asymptomatic, no correction needed yet.
  {
    id: 'seed-visit-sunita-1',
    patientId: 'seed-patient-sunita',
    visitAt: agoIso(13),
    refractions: {
      left: { distance: { sphere: 0.5, visualAcuity: '6/6' }, reading: {} },
      right: { distance: { sphere: 0.75, visualAcuity: '6/6' }, reading: {} },
    },
    diagnosis: 'Mild hyperopia, asymptomatic',
    treatmentPlan: 'No correction needed at this time; review in 1 year',
    createdAt: ago(13),
    updatedAt: ago(13),
  },

  // Amit Joshi — astigmatism in both eyes, first-time correction.
  {
    id: 'seed-visit-amit-1',
    patientId: 'seed-patient-amit',
    visitAt: agoIso(8),
    refractions: {
      left: { distance: { sphere: -0.25, cylinder: -1.25, axis: 175, visualAcuity: '6/6' }, reading: {} },
      right: { distance: { sphere: -0.5, cylinder: -1.0, axis: 5, visualAcuity: '6/6' }, reading: {} },
    },
    lenses: 'Single vision, toric',
    diagnosis: 'Astigmatism, both eyes',
    treatmentPlan: 'Review in 1 year',
    createdAt: ago(8),
    updatedAt: ago(8),
  },

  // Anjali Gupta has no visits yet — demonstrates the empty-history state.
]

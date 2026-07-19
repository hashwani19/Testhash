import type { ClinicType } from '../types'

/** Shared shape for the clinic-profile fields captured at signup (§5.5 of
 *  docs/design.md), provisioned by a superuser, or later edited from
 *  Preferences — kept in its own file (not ClinicProfileFields.tsx) so
 *  exporting it doesn't break that component's Fast Refresh. */
export interface ClinicProfileValue {
  mobile: string
  clinicType: ClinicType
  clinicName: string
  clinicAddress: string
  doctorName: string
  doctorCredentials: string
  logoDataUrl: string
}

export const EMPTY_CLINIC_PROFILE: ClinicProfileValue = {
  mobile: '',
  clinicType: 'ophthalmology',
  clinicName: '',
  clinicAddress: '',
  doctorName: '',
  doctorCredentials: '',
  logoDataUrl: '',
}

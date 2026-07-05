import type { EyeRefraction, RefractionGrid } from '../types'

export function hasRefractionData(refraction: EyeRefraction): boolean {
  return (
    refraction.sphere != null ||
    refraction.cylinder != null ||
    refraction.axis != null ||
    refraction.addPower != null ||
    Boolean(refraction.visualAcuity)
  )
}

/** A visit needs at least one real value — a visit date alone isn't a record. */
export function isEmptyVisit(
  refractions: RefractionGrid,
  otherFields: Array<string | undefined>,
): boolean {
  const anyRefraction = (['left', 'right'] as const).some((eye) =>
    (['distance', 'reading'] as const).some((visionType) =>
      hasRefractionData(refractions[eye][visionType]),
    ),
  )
  const anyText = otherFields.some((value) => Boolean(value?.trim()))
  return !anyRefraction && !anyText
}

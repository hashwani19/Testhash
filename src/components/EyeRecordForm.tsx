import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { EyeVisitInput } from '../hooks/useEyeVisits'
import type { NewAttachmentInput } from '../hooks/useAttachments'
import type { Attachment, ClinicType, Eye, EyeRefraction, EyeVisit, RefractionGrid, VisionType } from '../types'
import { isEmptyVisit } from '../utils/eyeVisit'
import { compressImageFile } from '../utils/imageCompression'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { Textarea } from './common/Textarea'
import { ImageViewer, type ViewerImage } from './common/ImageViewer'
import { FormCard } from './common/FormCard'
import { fieldLabel, fieldLabelText } from '../styles'

interface Props {
  initial?: EyeVisit
  /** Orthopedic tenants don't have eyes to examine — the Left/Right eye
   *  refraction fieldsets only render for `ophthalmology` clinics. Every
   *  other field (lenses, diagnosis, treatment plan, follow-up, notes,
   *  attachments) is clinic-type-agnostic and always shown. */
  clinicType: ClinicType
  /** Hidden entirely for front_desk — attachments aren't rendered at all
   *  for that role (§8.4/§8.5 of docs/design.md), not just read-only. */
  canManageAttachments: boolean
  /** Deleting an already-saved attachment is admin-only, same restriction as
   *  deleting a visit (§4/§8.6) — doctor can view/upload but not remove one
   *  once saved. Removing a not-yet-saved pending photo isn't gated by this,
   *  since nothing has been persisted yet. */
  canDeleteAttachments: boolean
  /** Already-saved photos for this visit (empty when creating a new one). */
  attachments: Attachment[]
  onDeleteAttachment: (id: string) => void
  onSubmit: (input: EyeVisitInput, newAttachments: NewAttachmentInput[]) => void
  onCancel: () => void
}

interface CellState {
  sphere: string
  cylinder: string
  axis: string
  visualAcuity: string
}

const EMPTY_CELL: CellState = { sphere: '', cylinder: '', axis: '', visualAcuity: '' }

type GridState = Record<Eye, Record<VisionType, CellState>>

const EMPTY_GRID: GridState = {
  left: { distance: { ...EMPTY_CELL }, reading: { ...EMPTY_CELL } },
  right: { distance: { ...EMPTY_CELL }, reading: { ...EMPTY_CELL } },
}

const toLocalInputValue = (date: Date) => {
  const d = new Date(date)
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const nowLocal = () => toLocalInputValue(new Date())

function cellToRefraction(cell: CellState): EyeRefraction {
  return {
    sphere: cell.sphere ? Number(cell.sphere) : undefined,
    cylinder: cell.cylinder ? Number(cell.cylinder) : undefined,
    axis: cell.axis ? Number(cell.axis) : undefined,
    visualAcuity: cell.visualAcuity.trim() || undefined,
  }
}

function refractionToCell(refraction: EyeRefraction): CellState {
  return {
    sphere: refraction.sphere != null ? String(refraction.sphere) : '',
    cylinder: refraction.cylinder != null ? String(refraction.cylinder) : '',
    axis: refraction.axis != null ? String(refraction.axis) : '',
    visualAcuity: refraction.visualAcuity ?? '',
  }
}

function gridToState(refractions: RefractionGrid): GridState {
  return {
    left: {
      distance: refractionToCell(refractions.left.distance),
      reading: refractionToCell(refractions.left.reading),
    },
    right: {
      distance: refractionToCell(refractions.right.distance),
      reading: refractionToCell(refractions.right.reading),
    },
  }
}

function RefractionCell({
  visionType,
  cell,
  onChange,
}: {
  visionType: VisionType
  cell: CellState
  onChange: (next: CellState) => void
}) {
  const label = visionType === 'distance' ? 'Distance' : 'Reading'
  return (
    <div className="flex flex-col gap-2 border-t border-border py-2 first:border-t-0 first:pt-0">
      {/* Deliberately subdued relative to the Left/Right eye legend above. */}
      <span className="text-[11px] font-medium uppercase tracking-wide text-text opacity-85">
        {label}
      </span>
      <div className="flex flex-wrap gap-2.5">
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Sphere</span>
          <TextInput
            type="number"
            step="any"
            inputMode="decimal"
            value={cell.sphere}
            onChange={(e) => onChange({ ...cell, sphere: e.target.value })}
            placeholder="0.00"
          />
        </label>
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Cylinder</span>
          <TextInput
            type="number"
            step="any"
            inputMode="decimal"
            value={cell.cylinder}
            onChange={(e) => onChange({ ...cell, cylinder: e.target.value })}
            placeholder="0.00"
          />
        </label>
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Axis</span>
          <TextInput
            type="number"
            min={0}
            max={180}
            step={1}
            inputMode="numeric"
            value={cell.axis}
            onChange={(e) => onChange({ ...cell, axis: e.target.value })}
            placeholder="0-180"
          />
        </label>
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Visual acuity</span>
          <TextInput
            type="text"
            value={cell.visualAcuity}
            onChange={(e) => onChange({ ...cell, visualAcuity: e.target.value })}
            placeholder={visionType === 'distance' ? '6/6' : 'N/6'}
          />
        </label>
      </div>
    </div>
  )
}

export function EyeRecordForm({
  initial,
  clinicType,
  canManageAttachments,
  canDeleteAttachments,
  attachments,
  onDeleteAttachment,
  onSubmit,
  onCancel,
}: Props) {
  const [visitAt, setVisitAt] = useState(
    initial ? toLocalInputValue(new Date(initial.visitAt)) : nowLocal(),
  )
  const [grid, setGrid] = useState<GridState>(
    initial ? gridToState(initial.refractions) : EMPTY_GRID,
  )
  const [lenses, setLenses] = useState(initial?.lenses ?? '')
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis ?? '')
  const [treatmentPlan, setTreatmentPlan] = useState(initial?.treatmentPlan ?? '')
  const [followUpDate, setFollowUpDate] = useState(initial?.followUpDate ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const [pendingAttachments, setPendingAttachments] = useState<NewAttachmentInput[]>([])
  const [compressing, setCompressing] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const allImages: ViewerImage[] = useMemo(
    () => [
      ...attachments.map((a) => ({ src: a.dataUrl, alt: a.fileName })),
      ...pendingAttachments.map((a) => ({ src: a.dataUrl, alt: a.fileName })),
    ],
    [attachments, pendingAttachments],
  )

  const setCell = (eye: Eye, visionType: VisionType, next: CellState) => {
    setGrid((prev) => ({ ...prev, [eye]: { ...prev[eye], [visionType]: next } }))
  }

  const refractions: RefractionGrid = useMemo(
    () => ({
      left: {
        distance: cellToRefraction(grid.left.distance),
        reading: cellToRefraction(grid.left.reading),
      },
      right: {
        distance: cellToRefraction(grid.right.distance),
        reading: cellToRefraction(grid.right.reading),
      },
    }),
    [grid],
  )

  // A visit with only a photo attached (no clinical fields) is still a real
  // record worth saving — attachments count as content alongside refractions
  // and text fields.
  const isEmpty =
    isEmptyVisit(refractions, [lenses, diagnosis, treatmentPlan, followUpDate, notes]) &&
    attachments.length === 0 &&
    pendingAttachments.length === 0

  // Whether cancelling would actually lose something. For a new record
  // that's the same as "not empty" — but when editing, the form starts
  // pre-filled from `initial`, so isEmpty is never true; the right question
  // there is whether anything differs from what was loaded (§ AppointmentForm
  // isDirty, same idea).
  const hasUnsavedChanges = initial
    ? visitAt !== toLocalInputValue(new Date(initial.visitAt)) ||
      JSON.stringify(grid) !== JSON.stringify(gridToState(initial.refractions)) ||
      lenses !== (initial.lenses ?? '') ||
      diagnosis !== (initial.diagnosis ?? '') ||
      treatmentPlan !== (initial.treatmentPlan ?? '') ||
      followUpDate !== (initial.followUpDate ?? '') ||
      notes !== (initial.notes ?? '') ||
      pendingAttachments.length > 0
    : !isEmpty

  const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    e.target.value = ''
    if (files.length === 0) return
    setCompressing(true)
    try {
      const compressed = await Promise.all(files.map(compressImageFile))
      setPendingAttachments((prev) => [...prev, ...compressed])
    } finally {
      setCompressing(false)
    }
  }

  const removePending = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (isEmpty) return
    onSubmit(
      {
        visitAt: new Date(visitAt).toISOString(),
        refractions,
        lenses,
        diagnosis,
        treatmentPlan,
        followUpDate,
        notes,
      },
      pendingAttachments,
    )
  }

  return (
    <>
      <FormCard
        title={initial ? 'Edit prescription' : 'Add prescription'}
        onCancel={onCancel}
        onSubmit={submit}
        submitLabel={initial ? 'Save changes' : 'Save prescription'}
        submitDisabled={isEmpty}
        isDirty={hasUnsavedChanges}
        discardTitle="Discard this prescription?"
      >
        <label className={fieldLabel}>
          <span className={fieldLabelText}>Visit date &amp; time</span>
          <TextInput
            type="datetime-local"
            value={visitAt}
            max={nowLocal()}
            onChange={(e) => setVisitAt(e.target.value)}
            required
          />
        </label>

        {clinicType !== 'orthopedic' &&
          (['left', 'right'] as Eye[]).map((eye) => (
            // min-w-0 is required: fieldsets don't shrink in flex layouts by
            // default, so without it this overflows past the card's edge.
            <fieldset className="min-w-0 rounded-xl border border-border p-3" key={eye}>
              <legend className="px-2 text-[17px] font-bold text-text-h">
                {eye === 'left' ? 'Left' : 'Right'} eye
              </legend>
              <RefractionCell
                visionType="distance"
                cell={grid[eye].distance}
                onChange={(next) => setCell(eye, 'distance', next)}
              />
              <RefractionCell
                visionType="reading"
                cell={grid[eye].reading}
                onChange={(next) => setCell(eye, 'reading', next)}
              />
            </fieldset>
          ))}

        {clinicType !== 'orthopedic' && (
          <label className={fieldLabel}>
            <span className={fieldLabelText}>Lenses (optional)</span>
            <TextInput
              type="text"
              value={lenses}
              onChange={(e) => setLenses(e.target.value)}
              placeholder="Progressive, bifocal, single vision…"
            />
          </label>
        )}

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Diagnosis (optional)</span>
          <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} />
        </label>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Treatment plan (optional)</span>
          <Textarea value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} rows={2} />
        </label>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Follow-up date (optional)</span>
          <TextInput
            type="date"
            value={followUpDate}
            min={visitAt.slice(0, 10)}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </label>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Notes (optional)</span>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Other observations…"
          />
        </label>

        {canManageAttachments && (
          <div className="flex flex-col gap-2">
            <span className={fieldLabelText}>Prescription photos (optional)</span>

            {(attachments.length > 0 || pendingAttachments.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  <div
                    key={a.id}
                    className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border"
                    onClick={() => setViewerIndex(i)}
                  >
                    <img src={a.dataUrl} alt={a.fileName} className="h-full w-full object-cover" />
                    {canDeleteAttachments && (
                      <Button
                        variant="icon"
                        aria-label={`Remove ${a.fileName}`}
                        className="absolute right-0.5 top-0.5 h-6 w-6 rounded-full bg-surface/90 text-base leading-none"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteAttachment(a.id)
                        }}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                {pendingAttachments.map((a, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border"
                    onClick={() => setViewerIndex(attachments.length + i)}
                  >
                    <img src={a.dataUrl} alt={a.fileName} className="h-full w-full object-cover" />
                    <Button
                      variant="icon"
                      aria-label={`Remove ${a.fileName}`}
                      className="absolute right-0.5 top-0.5 h-6 w-6 rounded-full bg-surface/90 text-base leading-none"
                      onClick={(e) => {
                        e.stopPropagation()
                        removePending(i)
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative w-fit">
              <Button variant="secondary" disabled={compressing}>
                {compressing ? 'Processing…' : 'Add photo'}
              </Button>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                disabled={compressing}
                onChange={handleFilesSelected}
                className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-default"
                aria-label="Add prescription photo"
              />
            </div>
          </div>
        )}

        {isEmpty && (
          <p className="text-right text-[13px] text-text">
            Enter at least one value below the visit date to save a record.
          </p>
        )}
      </FormCard>

      {viewerIndex != null && (
        <ImageViewer images={allImages} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </>
  )
}

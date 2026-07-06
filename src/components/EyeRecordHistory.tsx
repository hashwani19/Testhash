import { useState } from 'react'
import type { Attachment, Eye, EyeRefraction, EyeVisit, VisionType } from '../types'
import { Button } from './common/Button'
import { Card, CardHeader } from './common/Card'
import { ListView } from './common/ListView'
import { ImageViewer } from './common/ImageViewer'
import { EditIcon } from './common/icons'
import { ConfirmModal } from './ConfirmModal'
import { usePreferences } from '../hooks/usePreferences'
import { hasRefractionData } from '../utils/eyeVisit'

interface Props {
  visits: EyeVisit[]
  canDelete: boolean
  /** Hidden entirely for front_desk (§8.4 of docs/design.md) — not just read-only. */
  canViewAttachments: boolean
  attachments: Attachment[]
  onEdit: (visit: EyeVisit) => void
  onDelete: (id: string) => void
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
}

// new Date("YYYY-MM-DD") parses as UTC midnight, which can display as the
// previous day in timezones behind UTC — build the Date from local
// components instead.
function formatDateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatVisitDateTime(visitAt: string): string {
  return new Date(visitAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function RefractionRow({ visionType, refraction }: { visionType: VisionType; refraction: EyeRefraction }) {
  if (!hasRefractionData(refraction)) return null

  const label = visionType === 'distance' ? 'Dist' : 'Read'
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-text">
      {/* Deliberately subdued relative to the Left/Right eye label above,
          but same baseline/family as the values so the row reads as one
          row rather than two mismatched fonts. */}
      <span className="min-w-[34px] text-[12px] font-semibold uppercase tracking-wide text-text-h">
        {label}
      </span>
      {refraction.sphere != null && <span>SPH {formatSigned(refraction.sphere)}</span>}
      {refraction.cylinder != null && <span>CYL {formatSigned(refraction.cylinder)}</span>}
      {refraction.axis != null && <span>Axis {refraction.axis}</span>}
      {refraction.visualAcuity && <span>VA {refraction.visualAcuity}</span>}
    </div>
  )
}

function EyeSection({ eye, refractions }: { eye: Eye; refractions: EyeVisit['refractions'][Eye] }) {
  if (!hasRefractionData(refractions.distance) && !hasRefractionData(refractions.reading)) {
    return null
  }
  return (
    <div className="flex flex-col gap-1 border-t border-border py-2 first:border-t-0 first:pt-0">
      <span className="text-base font-bold text-text-h">{eye === 'left' ? 'Left' : 'Right'} eye</span>
      <RefractionRow visionType="distance" refraction={refractions.distance} />
      <RefractionRow visionType="reading" refraction={refractions.reading} />
    </div>
  )
}

function VisitAttachments({
  attachments,
  onView,
}: {
  attachments: Attachment[]
  onView: (attachment: Attachment) => void
}) {
  if (attachments.length === 0) return null
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {attachments.map((a) => (
        <Button key={a.id} variant="unstyled" className="cursor-pointer" onClick={() => onView(a)}>
          <img src={a.dataUrl} alt={a.fileName} className="h-16 w-16 rounded-lg border border-border object-cover" />
        </Button>
      ))}
    </div>
  )
}

export function EyeRecordHistory({
  visits,
  canDelete,
  canViewAttachments,
  attachments,
  onEdit,
  onDelete,
}: Props) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const confirmingVisit = visits.find((v) => v.id === confirmingDeleteId) ?? null
  const [viewingAttachment, setViewingAttachment] = useState<Attachment | null>(null)
  const { preferences } = usePreferences()

  return (
    <>
      <ListView
        items={visits}
        getKey={(visit) => visit.id}
        pageSize={preferences.listPageSize}
        itemLabel="record"
        emptyMessage="No history yet. Add the first eye record."
        renderItem={(visit) => (
          <Card className="flex flex-col gap-1.5">
            <CardHeader
              title={formatVisitDateTime(visit.visitAt)}
              actions={
                <>
                  <Button variant="icon" aria-label="Edit record" onClick={() => onEdit(visit)}>
                    <EditIcon />
                  </Button>
                  {canDelete && (
                    <Button
                      variant="icon"
                      aria-label="Delete record"
                      onClick={() => setConfirmingDeleteId(visit.id)}
                    >
                      ×
                    </Button>
                  )}
                </>
              }
            />
            <EyeSection eye="left" refractions={visit.refractions.left} />
            <EyeSection eye="right" refractions={visit.refractions.right} />
            {visit.lenses && (
              <p className="mt-1 text-[13px] text-text">
                <strong>Lenses:</strong> {visit.lenses}
              </p>
            )}
            {visit.diagnosis && (
              <p className="mt-1 text-[13px] text-text">
                <strong>Diagnosis:</strong> {visit.diagnosis}
              </p>
            )}
            {visit.treatmentPlan && (
              <p className="mt-1 text-[13px] text-text">
                <strong>Treatment plan:</strong> {visit.treatmentPlan}
              </p>
            )}
            {visit.followUpDate && (
              <p className="mt-1 text-[13px] text-text">
                <strong>Follow-up:</strong> {formatDateOnly(visit.followUpDate)}
              </p>
            )}
            {visit.notes && <p className="mt-1 text-[13px] text-text">{visit.notes}</p>}
            {canViewAttachments && (
              <VisitAttachments
                attachments={attachments.filter((a) => a.visitId === visit.id)}
                onView={setViewingAttachment}
              />
            )}
          </Card>
        )}
      />

      {confirmingVisit && (
        <ConfirmModal
          title="Delete this record?"
          warning={`This permanently deletes the ${formatVisitDateTime(
            confirmingVisit.visitAt,
          )} treatment record. This cannot be undone.`}
          mode="yesNo"
          confirmLabel="Delete"
          tone="danger"
          onConfirm={() => {
            onDelete(confirmingVisit.id)
            setConfirmingDeleteId(null)
          }}
          onCancel={() => setConfirmingDeleteId(null)}
        />
      )}

      {viewingAttachment && (
        <ImageViewer
          src={viewingAttachment.dataUrl}
          alt={viewingAttachment.fileName}
          onClose={() => setViewingAttachment(null)}
        />
      )}
    </>
  )
}

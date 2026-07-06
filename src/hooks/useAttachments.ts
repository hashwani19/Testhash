import { useCallback, useEffect, useState } from 'react'
import type { Attachment } from '../types'
import { useAuditLog } from './useAuditLog'

const STORAGE_KEY = 'testhash.attachments.v1'

function loadAttachments(): Attachment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Attachment[]
  } catch {
    // fall through to an empty list
  }
  return []
}

export interface NewAttachmentInput {
  fileName: string
  contentType: string
  dataUrl: string
  sizeBytes: number
}

/** Metadata-only snapshot for the audit log — never the dataUrl itself,
 *  which would bloat every log entry with the full compressed image. */
function auditSnapshot(attachment: Attachment) {
  return {
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    sizeBytes: attachment.sizeBytes,
    visitId: attachment.visitId,
  }
}

export function useAttachments() {
  const [attachments, setAttachments] = useState<Attachment[]>(() => loadAttachments())
  const { logEntry } = useAuditLog()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attachments))
  }, [attachments])

  const addAttachments = useCallback(
    (visitId: string, inputs: NewAttachmentInput[]) => {
      if (inputs.length === 0) return
      const now = Date.now()
      const added: Attachment[] = inputs.map((input) => ({
        id: crypto.randomUUID(),
        visitId,
        fileName: input.fileName,
        contentType: input.contentType,
        dataUrl: input.dataUrl,
        sizeBytes: input.sizeBytes,
        createdAt: now,
      }))
      setAttachments((prev) => [...prev, ...added])
      for (const attachment of added) {
        logEntry({
          action: 'create',
          entityType: 'attachment',
          entityId: attachment.id,
          entityLabel: attachment.fileName,
          after: auditSnapshot(attachment),
        })
      }
    },
    [logEntry],
  )

  const deleteAttachment = useCallback(
    (id: string) => {
      const before = attachments.find((a) => a.id === id)
      setAttachments((prev) => prev.filter((a) => a.id !== id))
      if (before) {
        logEntry({
          action: 'delete',
          entityType: 'attachment',
          entityId: id,
          entityLabel: before.fileName,
          before: auditSnapshot(before),
        })
      }
    },
    [attachments, logEntry],
  )

  /** Cascade cleanup when one or more visits are deleted (§5.1 of
   *  docs/design.md — attachments belong to a visit, not a patient
   *  directly). Logs one delete entry per removed attachment, same as
   *  useEyeVisits' own patient-level cascade already does for visits. */
  const deleteAttachmentsForVisits = useCallback(
    (visitIds: string[]) => {
      const idSet = new Set(visitIds)
      const toDelete = attachments.filter((a) => idSet.has(a.visitId))
      if (toDelete.length === 0) return
      setAttachments((prev) => prev.filter((a) => !idSet.has(a.visitId)))
      for (const attachment of toDelete) {
        logEntry({
          action: 'delete',
          entityType: 'attachment',
          entityId: attachment.id,
          entityLabel: attachment.fileName,
          before: auditSnapshot(attachment),
        })
      }
    },
    [attachments, logEntry],
  )

  const getAttachmentsForVisit = useCallback(
    (visitId: string) => attachments.filter((a) => a.visitId === visitId),
    [attachments],
  )

  return { attachments, addAttachments, deleteAttachment, deleteAttachmentsForVisits, getAttachmentsForVisit }
}

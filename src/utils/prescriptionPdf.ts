import type { EyeRefraction, EyeVisit, Patient, PrescriptionTemplate } from '../types'
import { getPatientAge } from './age'

/** The letterhead fallback when no clinicName is configured — matches the
 *  hardcoded app-wide title (LoginScreen, AppHeader, index.html). Exported
 *  so PrescriptionPrint's on-screen preview and this PDF can't drift. */
export const DEFAULT_CLINIC_NAME = 'Ortho and Vision Care'

// US Letter in mm.
const PAGE_W = 215.9
const PAGE_H = 279.4
const MARGIN = 15

function formatSigned(value?: number): string {
  if (value == null) return ''
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
}

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

function refractionCells(r: EyeRefraction): string[] {
  return [
    formatSigned(r.sphere),
    formatSigned(r.cylinder),
    r.axis != null ? `${r.axis}°` : '',
    r.visualAcuity ?? '',
  ]
}

function logoImageFormat(dataUrl: string): string {
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG'
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP'
  return 'PNG'
}

/**
 * Renders the same prescription the PrescriptionPrint overlay shows into an
 * actual PDF file, client-side (docs/design.md §5.6). This exists because
 * `window.print()` is a dead end on iOS home-screen web apps — the print
 * dialog opens but its preview renders blank at the platform level — so
 * those contexts hand this file to the native share sheet (which includes
 * AirPrint) instead of ever calling `window.print()`.
 *
 * jsPDF is imported dynamically so it lands in its own lazy chunk instead
 * of the main bundle; PrescriptionPrint pre-builds the file on mount so the
 * Share tap itself stays synchronous (user-gesture safe, § checkpoint D).
 */
export async function buildPrescriptionPdf(
  patient: Patient,
  visit: EyeVisit,
  template: PrescriptionTemplate,
): Promise<File> {
  const { jsPDF, GState } = await import('jspdf')

  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const left = MARGIN
  const right = PAGE_W - MARGIN
  const contentW = right - left
  let y = MARGIN + Math.max(template.topMarginMm, 0)

  // Faint centered watermark behind everything — drawn first so all later
  // content paints over it, mirroring the overlay's opacity-10 logo.
  if (template.logoDataUrl) {
    try {
      const side = 120
      doc.saveGraphicsState()
      doc.setGState(new GState({ opacity: 0.08 }))
      doc.addImage(
        template.logoDataUrl,
        logoImageFormat(template.logoDataUrl),
        (PAGE_W - side) / 2,
        (PAGE_H - side) / 2,
        side,
        side,
      )
      doc.restoreGraphicsState()
    } catch {
      // A logo jsPDF can't decode shouldn't block the prescription itself.
      doc.restoreGraphicsState()
    }
  }

  doc.setTextColor(0, 0, 0)

  if (template.showLetterhead) {
    let textX = left
    let logoBottom = y
    if (template.logoDataUrl) {
      try {
        doc.addImage(template.logoDataUrl, logoImageFormat(template.logoDataUrl), left, y, 18, 18)
        textX = left + 22
        logoBottom = y + 18
      } catch {
        // Header logo is optional decoration; skip on decode failure.
      }
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(template.clinicName?.trim() || DEFAULT_CLINIC_NAME, textX, y + 6)
    let leftBottom = y + 8

    if (template.clinicAddress) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const lines = doc.splitTextToSize(template.clinicAddress, contentW * 0.55)
      doc.text(lines, textX, y + 12)
      leftBottom = y + 12 + (lines.length - 1) * 3.8
    }

    let rightBottom = y
    if (template.doctorName || template.doctorCredentials) {
      if (template.doctorName) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(template.doctorName, right, y + 5, { align: 'right' })
        rightBottom = y + 6
      }
      if (template.doctorCredentials) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        const lines = doc.splitTextToSize(template.doctorCredentials, contentW * 0.4)
        doc.text(lines, right, rightBottom + 4, { align: 'right' })
        rightBottom = rightBottom + 4 + (lines.length - 1) * 3.4
      }
    }

    y = Math.max(leftBottom, rightBottom, logoBottom) + 4
    doc.setDrawColor(0)
    doc.setLineWidth(0.7)
    doc.line(left, y, right, y)
    y += 8
  }

  // Patient / visit row.
  const age = getPatientAge(patient)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(patient.name, left, y)
  const nameW = doc.getTextWidth(patient.name)
  doc.setFont('helvetica', 'normal')
  doc.text(`(${patient.patientNumber})`, left + nameW + 2, y)
  doc.setFontSize(10)
  doc.text(`Visit: ${formatVisitDateTime(visit.visitAt)}`, right, y, { align: 'right' })
  y += 5.5
  doc.text(
    `Age: ${age != null ? `${age} years` : '—'} · Gender: ${
      patient.gender === 'unspecified' ? '—' : patient.gender
    }`,
    left,
    y,
  )
  y += 8

  // Refraction table — same fixed 9-column shape as the overlay (§5.6:
  // every cell always prints, blank if unset).
  const col0 = 26
  const colW = (contentW - col0) / 8
  const rowH = 8
  const headerLabels = ['Sph', 'Cyl', 'Axis', 'V.A.', 'Sph', 'Cyl', 'Axis', 'V.A.']
  const rows: Array<{ label: string; cells: string[] }> = [
    {
      label: 'Distance',
      cells: [...refractionCells(visit.refractions.right.distance), ...refractionCells(visit.refractions.left.distance)],
    },
    {
      label: 'Reading',
      cells: [...refractionCells(visit.refractions.right.reading), ...refractionCells(visit.refractions.left.reading)],
    },
  ]

  doc.setDrawColor(140)
  doc.setLineWidth(0.25)

  // Row 1: eye group headers spanning 4 columns each.
  doc.rect(left, y, col0, rowH)
  doc.rect(left + col0, y, colW * 4, rowH)
  doc.rect(left + col0 + colW * 4, y, colW * 4, rowH)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Right eye', left + col0 + colW * 2, y + rowH / 2 + 1.3, { align: 'center' })
  doc.text('Left eye', left + col0 + colW * 6, y + rowH / 2 + 1.3, { align: 'center' })
  y += rowH

  // Row 2: per-column labels.
  doc.rect(left, y, col0, rowH)
  headerLabels.forEach((label, i) => {
    const x = left + col0 + colW * i
    doc.rect(x, y, colW, rowH)
    doc.text(label, x + colW / 2, y + rowH / 2 + 1.3, { align: 'center' })
  })
  y += rowH

  // Data rows.
  doc.setFont('helvetica', 'normal')
  for (const row of rows) {
    doc.rect(left, y, col0, rowH)
    doc.text(row.label, left + 2, y + rowH / 2 + 1.3)
    row.cells.forEach((cell, i) => {
      const x = left + col0 + colW * i
      doc.rect(x, y, colW, rowH)
      if (cell) doc.text(cell, x + colW / 2, y + rowH / 2 + 1.3, { align: 'center' })
    })
    y += rowH
  }
  y += 8

  // Detail lines — label bold, value normal with a hanging indent when it
  // wraps; em dash for empty, same as the overlay's DetailLine.
  doc.setFontSize(10)
  const details: Array<[string, string]> = [
    ['Lenses', visit.lenses ?? ''],
    ['Diagnosis', visit.diagnosis ?? ''],
    ['Treatment plan', visit.treatmentPlan ?? ''],
    ['Follow-up', visit.followUpDate ? formatDateOnly(visit.followUpDate) : ''],
    ['Notes', visit.notes ?? ''],
  ]
  for (const [label, value] of details) {
    if (y > PAGE_H - 40) {
      doc.addPage()
      y = MARGIN + 5
    }
    doc.setFont('helvetica', 'bold')
    const labelText = `${label}:`
    doc.text(labelText, left, y)
    const labelW = doc.getTextWidth(labelText) + 1.5
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(value || '—', contentW - labelW)
    doc.text(lines, left + labelW, y)
    y += lines.length * 4.6 + 1.5
  }

  // Signature line, right-aligned.
  if (y > PAGE_H - 35) {
    doc.addPage()
    y = MARGIN + 5
  }
  y += 12
  doc.setDrawColor(0)
  doc.setLineWidth(0.3)
  doc.line(right - 50, y, right, y)
  doc.text('Signature', right - 25, y + 5, { align: 'center' })

  if (template.footerNote) {
    doc.setDrawColor(140)
    doc.setLineWidth(0.25)
    doc.line(left, PAGE_H - 22, right, PAGE_H - 22)
    doc.setFontSize(8)
    const lines = doc.splitTextToSize(template.footerNote, contentW)
    doc.text(lines, PAGE_W / 2, PAGE_H - 17, { align: 'center' })
  }

  const fileName = `Prescription - ${patient.name.replace(/[\\/:*?"<>|]/g, '')} - ${visit.visitAt.slice(0, 10)}.pdf`
  return new File([doc.output('blob')], fileName, { type: 'application/pdf' })
}

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  onClose: () => void
}

/**
 * Deliberately bare-bones print test (docs/design.md §13) — no Tailwind, no
 * fixed positioning, no watermark/logo, no @page override, no viewport-
 * pinning or DOM-removal-before-print tricks. Just a portal (so the
 * existing `@media print { #root { display: none } }` rule in index.css
 * still hides the rest of the app), a heading, a paragraph, and a Print
 * button that calls window.print() directly.
 *
 * Temporarily swapped in for PrescriptionPrint at the print icon's call
 * site in EyeRecordHistory, to isolate whether printing works at all from
 * this app on iOS, or whether it's something specific to the real
 * prescription overlay. PrescriptionPrint itself is untouched — swap it
 * back in once that's answered.
 */
export function SimplePrintTest({ onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleAfterPrint = () => onClose()
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [onClose])

  useEffect(() => {
    // Plain JS, not CSS: this portal renders in normal document flow, after
    // the entire (much taller) app — deliberately no positioning tricks
    // here, so just scroll to it rather than adding any.
    rootRef.current?.scrollIntoView()
  }, [])

  return createPortal(
    <div ref={rootRef} style={{ padding: 16, fontFamily: 'sans-serif', color: '#000', background: '#fff' }}>
      <p>
        <button onClick={() => window.print()}>Print</button>{' '}
        <button onClick={onClose}>Close</button>
      </p>
      <h1>Test print page</h1>
      <p>If you can see this text in the print preview or on paper, printing works from this app on this device.</p>
    </div>,
    document.body,
  )
}

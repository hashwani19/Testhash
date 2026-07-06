import { Button } from './Button'
import { dimmedBackdrop } from '../../styles'

interface Props {
  src: string
  alt: string
  onClose: () => void
}

/**
 * Full-screen image preview overlay. Every prescription photo in this
 * local-only build is a `data:` URL (§7 of docs/design.md — no R2/object
 * storage yet), and modern browsers block top-level navigation to a
 * `data:` URL from a click (`<a href target="_blank">` or `window.open`) —
 * it silently does nothing rather than opening. Rendering the image
 * in-page instead sidesteps that entirely, since it's never a navigation.
 */
export function ImageViewer({ src, alt, onClose }: Props) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-5 ${dimmedBackdrop}`}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <img src={src} alt={alt} className="max-h-full max-w-full rounded-xl object-contain shadow-card" />
      <Button
        variant="icon"
        aria-label="Close image"
        className="absolute right-4 top-4 h-9 w-9 rounded-full bg-surface/90 text-xl leading-none"
        onClick={onClose}
      >
        ×
      </Button>
    </div>
  )
}

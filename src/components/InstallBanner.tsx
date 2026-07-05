import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export function InstallBanner() {
  const { installed, canPromptInstall, promptInstall, showIosInstructions } =
    useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (installed || dismissed) return null
  if (!canPromptInstall && !showIosInstructions) return null

  return (
    <div className="banner banner-install" role="complementary">
      {canPromptInstall && (
        <>
          <span>Install this app for offline access and a full-screen feel.</span>
          <button className="btn-ghost" onClick={promptInstall}>
            Install
          </button>
        </>
      )}
      {showIosInstructions && (
        <span>
          Install this app: tap the Share icon, then "Add to Home Screen".
        </span>
      )}
      <button
        className="btn-close"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  )
}

import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { Button } from './common/Button'

export function InstallBanner() {
  const { installed, canPromptInstall, promptInstall, showIosInstructions } =
    useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (installed || dismissed) return null
  if (!canPromptInstall && !showIosInstructions) return null

  return (
    <div
      className="flex items-center gap-2.5 border-b border-border bg-surface px-4 py-2.5 text-[13px] text-text-h"
      role="complementary"
    >
      {canPromptInstall && (
        <>
          <span className="flex-1">Install this app for offline access and a full-screen feel.</span>
          <Button variant="ghost" onClick={promptInstall}>
            Install
          </Button>
        </>
      )}
      {showIosInstructions && (
        <span className="flex-1">
          Install this app: tap the Share icon, then "Add to Home Screen".
        </span>
      )}
      <Button variant="icon" aria-label="Dismiss" onClick={() => setDismissed(true)}>
        ×
      </Button>
    </div>
  )
}

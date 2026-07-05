import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="banner banner-offline" role="status">
      You're offline — changes are saved on this device.
    </div>
  )
}

import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div
      className="flex items-center justify-center gap-2.5 bg-medium px-4 py-2.5 text-[13px] text-[#1c1400]"
      role="status"
    >
      You're offline — changes are saved on this device.
    </div>
  )
}

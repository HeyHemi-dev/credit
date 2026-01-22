import { useThrottledState } from '@tanstack/react-pacer'
import { tryCatch } from '@/lib/try-catch'
import { isServer, sleep } from '@/lib/utils'

export function useClipboard() {
  const THROTTLE_MS = 1500
  const [isCopied, setIsCopied] = useThrottledState(false, {
    wait: THROTTLE_MS,
  })

  const copy = async (text: string) => {
    if (isServer) return
    const { error } = await tryCatch(navigator.clipboard.writeText(text))
    if (error) return
    setIsCopied(true)
    await sleep(THROTTLE_MS)
    setIsCopied(false)
  }

  return { isCopied, copy }
}

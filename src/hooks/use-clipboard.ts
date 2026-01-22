import { useThrottledState } from '@tanstack/react-pacer'
import { tryCatch } from '@/lib/try-catch'
import { isServer, sleep } from '@/lib/utils'
import { THROTTLE_COPY_MS } from '@/lib/constants'

export function useClipboard() {
  const [isCopied, setIsCopied] = useThrottledState(false, {
    wait: THROTTLE_COPY_MS,
  })

  const copy = async (text: string) => {
    if (isServer) return
    const { error } = await tryCatch(navigator.clipboard.writeText(text))
    if (error) return
    setIsCopied(true)
    await sleep(THROTTLE_COPY_MS)
    setIsCopied(false)
  }

  return { isCopied, copy }
}

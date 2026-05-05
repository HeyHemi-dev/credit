const GRADIENT_HUE_RANGE = { min: 0, max: 360 }
const GRADIENT_LIGHTNESS = {
  min: 0.8,
  max: 0.88,
}
const GRADIENT_CHROMA = {
  min: 0.3,
  max: 0.5,
}
const GRADIENT_ALPHA = 0.07
const MIN_HUE_SEPARATION = 10
const HUE_SEPARATION_OFFSET = 120
const GRADIENT_ANGLE_RANGE = { min: 30, max: 30 }

type Gradient = { color1: string; color2: string; angle: number }

export async function uuidToGradient(uuid: string): Promise<Gradient> {
  const digest = await sha256Bytes(uuid)

  const h1 = map16(digest, 0, GRADIENT_HUE_RANGE.min, GRADIENT_HUE_RANGE.max)
  const c1 = map16(digest, 2, GRADIENT_CHROMA.min, GRADIENT_CHROMA.max)
  const l1 = map16(digest, 4, GRADIENT_LIGHTNESS.min, GRADIENT_LIGHTNESS.max)

  let h2 = map16(digest, 16, GRADIENT_HUE_RANGE.min, GRADIENT_HUE_RANGE.max)
  const c2 = map16(digest, 18, GRADIENT_CHROMA.min, GRADIENT_CHROMA.max)
  const l2 = map16(digest, 20, GRADIENT_LIGHTNESS.min, GRADIENT_LIGHTNESS.max)

  if (hueDiff(h1, h2) < MIN_HUE_SEPARATION) {
    h2 = (h2 + HUE_SEPARATION_OFFSET) % GRADIENT_HUE_RANGE.max
  }

  const angle = Math.round(
    map16(digest, 30, GRADIENT_ANGLE_RANGE.min, GRADIENT_ANGLE_RANGE.max),
  )

  return {
    color1: fmt(l1, c1, h1),
    color2: fmt(l2, c2, h2),
    angle,
  }
}

async function sha256Bytes(input: string) {
  const key = input.normalize('NFKC').trim()

  if (!globalThis.crypto?.subtle) return fallbackHashBytes(key)

  const data = new TextEncoder().encode(key)
  const buf = await globalThis.crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(buf)
}

/**
 * LAN device testing can run over plain HTTP, where iOS does not expose
 * `crypto.subtle`. The gradient is decorative, so a deterministic non-crypto
 * hash is enough as a local fallback.
 */
function fallbackHashBytes(input: string) {
  const bytes = new Uint8Array(32)
  let hash = 0x811c9dc5

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
    bytes[i % bytes.length] ^= hash >>> ((i % 4) * 8)
  }

  for (let i = input.length; i < bytes.length * 2; i++) {
    hash ^= i + 0x9e3779b9
    hash = Math.imul(hash, 0x01000193)
    bytes[i % bytes.length] ^= hash >>> ((i % 4) * 8)
  }

  return bytes
}

function map16(bytes: Uint8Array, i: number, min: number, max: number) {
  const t = ((bytes[i] << 8) | bytes[i + 1]) / 0xffff
  return min + (max - min) * t
}

function hueDiff(a: number, b: number) {
  return Math.abs(((b - a + 540) % 360) - 180)
}

function fmt(l: number, c: number, h: number) {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)} / ${GRADIENT_ALPHA})`
}

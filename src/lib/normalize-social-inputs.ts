export function normalizeInstagramInput(input: string) {
  if (input.startsWith('https://www.instagram.com/')) {
    input = input.replace('https://www.instagram.com/', '@')
  }
  if (input.endsWith('/')) {
    input = input.slice(0, -1)
  }
  return input
}

export function normalizeTiktokInput(input: string) {
  if (input.startsWith('https://www.tiktok.com/')) {
    input = input.replace('https://www.tiktok.com/', '@')
  }
  if (input.endsWith('/')) {
    input = input.slice(0, -1)
  }
  return input
}

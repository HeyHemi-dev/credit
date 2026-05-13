export const SITE_NAME = 'With Thanks'
export const SITE_URL = 'https://withthanks.nz'
export const HOME_TITLE = 'With Thanks | Collect wedding supplier tags'
export const HOME_DESCRIPTION =
  'Effortlessly collect supplier details from couples, formatted and ready-to-paste into Instagram.'
export const HOME_SHARE_IMAGE_PATH = '/homepage-share.png'
export const HOME_SHARE_IMAGE_WIDTH = '1200'
export const HOME_SHARE_IMAGE_HEIGHT = '630'
export const HOME_SHARE_IMAGE_ALT =
  'With Thanks helps wedding professionals collect supplier tags from couples'

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

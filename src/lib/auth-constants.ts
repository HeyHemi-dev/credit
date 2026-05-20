export const AUTH_API_BASE_PATH = '/api/auth'
export const AUTH_REDIRECT_PATH = '/events'
export const LOCAL_DEV_ORIGIN = 'http://localhost:5173'
const AUTH_PRODUCTION_ALLOWED_HOSTS = ['withthanks.nz', '*.vercel.app'] as const

const AUTH_DEVELOPMENT_ALLOWED_HOSTS = ['localhost:*', '192.168.*'] as const
const isProduction = process.env.NODE_ENV === 'production'

export const AUTH_ALLOWED_HOSTS = isProduction
  ? AUTH_PRODUCTION_ALLOWED_HOSTS
  : [...AUTH_PRODUCTION_ALLOWED_HOSTS, ...AUTH_DEVELOPMENT_ALLOWED_HOSTS]

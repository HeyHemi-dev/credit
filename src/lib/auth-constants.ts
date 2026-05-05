export const AUTH_API_BASE_PATH = '/api/auth'
export const LOCAL_DEV_ORIGIN = 'http://localhost:5173'
const AUTH_PRODUCTION_ALLOWED_HOSTS = ['withthanks.nz', '*.vercel.app'] as const

const AUTH_DEVELOPMENT_ALLOWED_HOSTS = ['localhost:*', '192.168.*'] as const

export const AUTH_ALLOWED_HOSTS =
  process.env.NODE_ENV === 'production'
    ? AUTH_PRODUCTION_ALLOWED_HOSTS
    : [...AUTH_PRODUCTION_ALLOWED_HOSTS, ...AUTH_DEVELOPMENT_ALLOWED_HOSTS]

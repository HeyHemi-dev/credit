import { createServerFn } from '@tanstack/react-start'
import { createAuthClient } from '@neondatabase/neon-js/auth'
import { BetterAuthVanillaAdapter } from '@neondatabase/neon-js/auth/vanilla'
import { ERROR } from '@/lib/errors'

type SessionUser = {
  id: string
  email?: string
  name?: string
}

export async function requireUserId(request: Request): Promise<string> {
  const authUrl = import.meta.env.VITE_NEON_AUTH_URL

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'A',location:'src/lib/server/auth.ts:requireUserId',message:'requireUserId entry',data:{hasAuthUrl:!!authUrl,hasCookie:!!request.headers.get('cookie'),cookieLen:(request.headers.get('cookie')??'').length},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // #region agent log
  (() => {
    const raw = request.headers.get('cookie') ?? ''
    const cookieNames = raw
      .split(';')
      .map((p) => p.trim().split('=')[0])
      .filter(Boolean)
      .slice(0, 12)
    const joined = cookieNames.join('|').toLowerCase()
    fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'F',location:'src/lib/server/auth.ts:requireUserId',message:'cookie names summary',data:{cookieNameCount:cookieNames.length,cookieNames,looksLikeNeonAuth:joined.includes('neon')||joined.includes('auth'),looksLikeSession:joined.includes('session')||joined.includes('token')},timestamp:Date.now()})}).catch(()=>{});
  })()
  // #endregion

  if (!authUrl) throw ERROR.INVALID_STATE('VITE_NEON_AUTH_URL is not set')

  // Use Vanilla adapter on the server (promise-based API, includes getSession()).
  const auth = createAuthClient(authUrl, {
    adapter: BetterAuthVanillaAdapter(),
    fetchOptions: {
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
    },
  }) as unknown as {
    getSession?: () => Promise<{ data?: { session?: { user?: SessionUser } }; error?: unknown }>
  }

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'B',location:'src/lib/server/auth.ts:requireUserId',message:'auth client created',data:{hasGetSession:typeof auth.getSession==='function'},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (typeof auth.getSession !== 'function') {
    throw ERROR.INVALID_STATE('Auth client does not support getSession()')
  }

  const { data, error } = await auth.getSession()

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'G',location:'src/lib/server/auth.ts:requireUserId',message:'getSession flags',data:{hasData:!!data,hasError:!!error,hasSession:!!(data as any)?.session,hasUser:!!(data as any)?.session?.user},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (error) throw ERROR.NOT_AUTHENTICATED()

  const userId = data?.session?.user?.id

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'C',location:'src/lib/server/auth.ts:requireUserId',message:'getSession result',data:{hasUserId:!!userId},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!userId) throw ERROR.NOT_AUTHENTICATED()
  return userId
}

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async ({ request }) => {
    const userId = await requireUserId(request)
    return { id: userId }
  },
)


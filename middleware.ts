import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/jwt'

// Rutas de API que requieren autenticación (mutaciones de datos)
const PROTECTED_API_ROUTES = [
  '/api/content',
  '/api/experience',
  '/api/projects',
  '/api/skills',
  '/api/other-skills',
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const method = request.method

  // ── Protección de rutas Admin (UI) ────────────────────────────────
  const isAdminPath = path.startsWith('/admin') && path !== '/admin/login'
  const isLoginPath = path === '/admin/login'

  const authToken = request.cookies.get('authToken')?.value
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'

  if (isAdminPath && (!authToken || !isLoggedIn)) {
    const url = new URL('/admin/login', request.url)
    return NextResponse.redirect(url)
  }

  if (isLoginPath && authToken && isLoggedIn) {
    const url = new URL('/admin/dashboard', request.url)
    return NextResponse.redirect(url)
  }

  // ── Protección de rutas API de escritura ─────────────────────────
  const isProtectedApi = PROTECTED_API_ROUTES.some(route => path.startsWith(route))
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

  if (isProtectedApi && isWriteMethod) {
    // Intentar obtener el token del header Authorization o de la cookie
    const bearerToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const tokenToVerify = bearerToken || authToken

    if (!tokenToVerify) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const isValid = await verifyAdminToken(tokenToVerify)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

// Aplicar a rutas admin y API de datos
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/content/:path*',
    '/api/experience/:path*',
    '/api/projects/:path*',
    '/api/skills/:path*',
    '/api/other-skills/:path*',
  ]
}

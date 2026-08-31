import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/jwt'

/**
 * Middleware — dos responsabilidades:
 *  1. Auth de `/admin/*` (UI) y de las escrituras de `/api/*` (JWT).
 *  2. i18n: prefijo de idioma en todas las rutas públicas (`/es/*`, `/en/*`).
 *     Rutas sin prefijo redirigen (307) a la versión con locale (cookie
 *     `NEXT_LOCALE` > default `es`). El locale resuelto se propaga al layout
 *     raíz por el header `x-locale` para el `<html lang>`.
 * Ver portfolio: planes/i18n-jevy-navegador-y-crawlers-2026-08-28 (Parte C).
 */
const LOCALES = ['es', 'en', 'fr', 'it'] as const
const DEFAULT_LOCALE = 'es'

const PROTECTED_API_ROUTES = [
  '/api/content',
  '/api/experience',
  '/api/projects',
  '/api/skills',
  '/api/other-skills',
]

function localeFromPath(pathname: string): string | null {
  const seg = pathname.split('/')[1]
  return (LOCALES as readonly string[]).includes(seg) ? seg : null
}

function isNonLocalizedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/feed.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/opengraph-image') ||
    pathname.includes('.')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  if (pathname.startsWith('/admin')) {
    const isLoginPath = pathname === '/admin/login'
    const authToken = request.cookies.get('authToken')?.value
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'

    if (!isLoginPath && (!authToken || !isLoggedIn)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (isLoginPath && authToken && isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api')) {
    const isProtectedApi = PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))
    const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

    if (isProtectedApi && isWriteMethod) {
      const bearerToken = request.headers.get('authorization')?.replace('Bearer ', '')
      const tokenToVerify = bearerToken || request.cookies.get('authToken')?.value
      if (!tokenToVerify) {
        return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
      }
      if (!(await verifyAdminToken(tokenToVerify))) {
        return NextResponse.json({ success: false, message: 'Token inválido o expirado' }, { status: 401 })
      }
    }
    return NextResponse.next()
  }

  if (isNonLocalizedPath(pathname)) {
    return NextResponse.next()
  }

  const pathLocale = localeFromPath(pathname)
  if (pathLocale) {
    const headers = new Headers(request.headers)
    headers.set('x-locale', pathLocale)
    return NextResponse.next({ request: { headers } })
  }

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const target = (LOCALES as readonly string[]).includes(cookieLocale || '') ? (cookieLocale as string) : DEFAULT_LOCALE
  const url = request.nextUrl.clone()
  url.pathname = `/${target}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url, 307)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}

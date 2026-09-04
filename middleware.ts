import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/auth/jwt'

/**
 * Middleware — dos responsabilidades:
 *  1. Auth de `/admin/*` (UI) y de las escrituras de `/api/*` (JWT).
 *  2. i18n: prefijo de idioma en todas las rutas públicas (`/es/*`, `/en/*`).
 *     Rutas sin prefijo redirigen (307) a la versión con locale (cookie
 *     `NEXT_LOCALE` > default `es`). El `<html lang>` lo resuelve el layout
 *     `(site)/[locale]` desde `params.locale` (ya no por header — así el árbol
 *     puede ser ISR). Ver portfolio: planes/force-dynamic-a-isr-2026-09-01.
 */
const LOCALES = ['es', 'en', 'fr', 'it'] as const
const DEFAULT_LOCALE = 'es'

// Rutas de API que requieren autenticación (mutaciones de datos)
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

// Rutas que NO llevan prefijo de idioma y NO se redirigen
function isNonLocalizedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/feed.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/opengraph-image') ||
    pathname === '/og' || // route handler de la imagen OG por defecto
    pathname.includes('.') // icon.png, archivos estáticos
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // ── /admin (UI) ───────────────────────────────────────────────────
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

  // ── /api (escrituras protegidas) ─────────────────────────────────
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

  // ── Archivos / rutas especiales sin idioma ───────────────────────
  if (isNonLocalizedPath(pathname)) {
    return NextResponse.next()
  }

  // ── i18n: rutas públicas ────────────────────────────────────────
  const pathLocale = localeFromPath(pathname)
  if (pathLocale) {
    // ya tiene prefijo — el layout lee el locale de `params`, nada que hacer acá
    return NextResponse.next()
  }

  // sin prefijo → redirigir a la versión con locale
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const target = (LOCALES as readonly string[]).includes(cookieLocale || '') ? (cookieLocale as string) : DEFAULT_LOCALE
  const url = request.nextUrl.clone()
  url.pathname = `/${target}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url, 307)
}

export const config = {
  // Corre en todo salvo assets de _next. La lógica de arriba filtra /api, /admin y estáticos.
  matcher: ['/((?!_next/static|_next/image).*)'],
}

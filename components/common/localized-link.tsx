"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import type { ComponentProps } from "react"

const LOCALES = ["es", "en", "fr", "it"]
const DEFAULT_LOCALE = "es"

/** Locale actual leído del segmento `/[locale]/` de la ruta. */
export function useLocale(): string {
  const params = useParams()
  const raw = params?.locale
  return typeof raw === "string" && LOCALES.includes(raw) ? raw : DEFAULT_LOCALE
}

/** `usePathname()` sin el prefijo de locale (`/es/work` → `/work`). Para comparar
 * contra hrefs sin prefijo (nav activa, exclusiones de chrome). */
export function usePathWithoutLocale(): string {
  const pathname = usePathname() || "/"
  const seg = pathname.split("/")[1]
  return LOCALES.includes(seg) ? pathname.slice(seg.length + 1) || "/" : pathname
}

/** Prefija un href absoluto (`/work`) con el locale, si no lo tiene ya. */
export function localizeHref(href: string, locale: string): string {
  if (!href.startsWith("/")) return href
  const firstSeg = href.split("/")[1]?.split(/[?#]/)[0] ?? ""
  if (LOCALES.includes(firstSeg)) return href
  return `/${locale}${href === "/" ? "" : href}`
}

/**
 * Drop-in de `next/link` que prefija los href absolutos con el locale actual
 * (`/work` → `/es/work`). Href externos, anclas sueltas (`#x`) o ya prefijados
 * pasan sin tocar. Ver portfolio: planes/i18n-jevy-navegador-y-crawlers-2026-08-28.
 */
export function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useLocale()
  const finalHref = typeof href === "string" ? localizeHref(href, locale) : href
  return <Link href={finalHref} {...props} />
}

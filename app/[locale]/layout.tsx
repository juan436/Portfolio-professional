import { notFound } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Layout del segmento de idioma (`/[locale]/*`). El `<html lang>`, los
 * providers y el chrome viven en el layout raíz (`app/layout.tsx`), que lee el
 * locale del header `x-locale` que setea el middleware. Acá solo se valida el
 * locale del segmento y se declaran los params estáticos.
 * Ver portfolio: planes/i18n-jevy-navegador-y-crawlers-2026-08-28 (Parte C).
 */
export const LOCALES = ["es", "en"] as const
export type Locale = (typeof LOCALES)[number]

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!(LOCALES as readonly string[]).includes(locale)) notFound()
  return <>{children}</>
}

import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { getHomeContent } from "@/lib/data/home-content"
import { ContentHydrator } from "@/components/content-hydrator"

/**
 * Layout del segmento de idioma (`/[locale]/*`). El `<html lang>`, los
 * providers y el chrome viven en el layout raíz (`app/layout.tsx`), que lee el
 * locale del header `x-locale` que setea el middleware. Acá se valida el locale
 * del segmento, se declaran los params estáticos y se hidrata el contenido del
 * sitio (una sola vez para todas las páginas públicas, `getHomeContent` va por
 * `unstable_cache`).
 * Ver portfolio: planes/i18n-jevy-navegador-y-crawlers-2026-08-28 (Parte C).
 */
export const LOCALES = ["es", "en", "fr", "it"] as const
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

  const content = await getHomeContent()

  return (
    <>
      <ContentHydrator full={content} />
      {children}
    </>
  )
}

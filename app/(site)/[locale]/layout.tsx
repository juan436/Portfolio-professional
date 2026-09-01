import type { ReactNode } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Inter } from "next/font/google"
import "../../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { ContentProvider } from "@/contexts/content"
import { ContentHydrator } from "@/components/content-hydrator"
import WolfGuide from "@/components/wolf"
import SiteChrome from "@/components/layout/site-chrome"
import { Toaster } from "@/components/ui/toaster"
import JsonLd from "@/app/components/json-ld"
import { getHomeContent } from "@/lib/data/home-content"
import { SITE_URL, SITE_NAME, AUTHOR_NAME, AUTHOR_DISPLAY_NAME } from "@/lib/site-config"

/**
 * Root layout del sitio público (`/[locale]/*`). Es el root layout de este grupo
 * `(site)` — trae el `<html>`/`<body>`, los providers, el chrome y la metadata.
 * El `<html lang>` sale de `params.locale` (no de `headers()`) → el árbol puede
 * ser ISR en vez de 100% dinámico. Ver portfolio: planes/force-dynamic-a-isr-2026-09-01.
 * Recibe: `children` + `params.locale`.
 * Produce: el documento HTML + el árbol de providers + `ContentHydrator`.
 */
const inter = Inter({ subsets: ["latin"] })

const LOCALES = ["es", "en", "fr", "it"] as const

export const dynamicParams = true
export const revalidate = 3600

export function generateStaticParams() {
  return [] as { locale: string }[]
}

const HOME_TITLE = `${AUTHOR_NAME} — Arquitecto de Soluciones y Dev Full Stack`
const HOME_OG_DESCRIPTION = `Web oficial de ${AUTHOR_NAME} (${SITE_NAME}): sistemas completos, infraestructura, automatizaciones y agentes de IA en producción.`

export const metadata: Metadata = {
  title: {
    default: HOME_TITLE,
    template: `%s | ${AUTHOR_NAME}`,
  },
  description:
    `Web oficial de ${AUTHOR_NAME} (${SITE_NAME}). Arquitecto de Soluciones y Desarrollador Full Stack: construye sistemas completos —front, back e infraestructura—, automatizaciones y agentes de IA en producción.`,
  keywords: "Juan Villegas, Jevy, desarrollador full stack, arquitecto de soluciones, programador, react, next.js, node.js, nestjs",
  authors: [{ name: AUTHOR_NAME, url: `${SITE_URL}/` }],
  creator: AUTHOR_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  metadataBase: new URL(`${SITE_URL}/`),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: `Blog — ${AUTHOR_DISPLAY_NAME}` }],
    },
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_OG_DESCRIPTION,
    url: `${SITE_URL}/`,
    siteName: SITE_NAME,
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_OG_DESCRIPTION,
    creator: "@juanvillegas",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function SiteLayout({
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
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-[#0a0a0a] text-slate-200`}>
        <JsonLd />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ContentProvider>
            <ContentHydrator full={content} />
            <LanguageProvider serverLocale={locale}>
              <SiteChrome>{children}</SiteChrome>
              <WolfGuide />
            </LanguageProvider>
            <Toaster />
          </ContentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

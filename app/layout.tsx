export const dynamic = 'force-dynamic';
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { ContentProvider } from "@/contexts/content"
import WolfGuide from "@/components/wolf"
import SiteChrome from "@/components/layout/site-chrome"
import { Toaster } from "@/components/ui/toaster"
import JsonLd from "@/app/components/json-ld"
import { SITE_URL, SITE_NAME, AUTHOR_NAME, AUTHOR_DISPLAY_NAME } from "@/lib/site-config"
const inter = Inter({ subsets: ["latin"] })

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

/**
 * Layout raíz del sitio — providers globales (Theme/Content/Language), chrome
 * compartido (SiteChrome, WolfGuide, Toaster) y metadata SEO.
 * Recibe: `children`.
 * Produce: el árbol de providers envolviendo `children`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-[#0a0a0a] text-slate-200`}>
        <JsonLd />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ContentProvider>
            <LanguageProvider>
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

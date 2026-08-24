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
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Juan Villegas | Desarrollador Full Stack",
    template: "%s | Juan Villegas",
  },
  description:
    "Portafolio profesional de Juan Villegas, desarrollador Full Stack especializado en Next.js, React, Node.js, Express, PHP y Laravel.",
  keywords: "Juan Villegas, portafolio, desarrollador, full stack, programador, react, next.js, node.js",
  authors: [{ name: "Juan Villegas", url: "https://jvillegas-portafolio.jvserver.com/" }],
  creator: "Juan Villegas",
  metadataBase: new URL('https://jvillegas-portafolio.jvserver.com/'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Juan Villegas | Desarrollador Full Stack",
    description: "Portafolio profesional de Juan Villegas, desarrollador Full Stack con experiencia en tecnologías modernas.",
    url: 'https://jvillegas-portafolio.jvserver.com/',
    siteName: "Juan Villegas Portfolio",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Juan Villegas | Desarrollador Full Stack",
    description: "Portafolio profesional de Juan Villegas, desarrollador Full Stack con experiencia en tecnologías modernas.",
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

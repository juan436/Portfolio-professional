export const dynamic = 'force-dynamic'

import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { ContentProvider } from "@/contexts/content"
import { ContentHydrator } from "@/components/content-hydrator"
import { Toaster } from "@/components/ui/toaster"
import { getHomeContent } from "@/lib/data/home-content"
import { SITE_URL } from "@/lib/site-config"

/**
 * Root layout de `/admin/*`. Grupo `(admin)` con su propio `<html>` — así el
 * sitio público (`(site)`) puede sacar el `headers()` del suyo y volverse ISR.
 * El admin siempre es `force-dynamic` (necesita el dato más fresco) y va en
 * español fijo (no usa i18n). `LanguageProvider serverLocale="es"` por si algún
 * componente compartido llama a `t()`.
 * Recibe: `children`.
 * Produce: documento HTML + providers mínimos + `ContentHydrator` (preview de imágenes).
 */
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: "Admin — Jevy",
  robots: { index: false, follow: false },
}

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const content = await getHomeContent()

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0a0a] text-slate-200`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ContentProvider>
            <ContentHydrator full={content} />
            <LanguageProvider serverLocale="es">{children}</LanguageProvider>
          </ContentProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

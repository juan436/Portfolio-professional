"use client"

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getTranslator, type TranslateFn } from "@/lib/i18n/dictionary"

/**
 * Provider de idioma. El idioma lo manda la URL (`/es/*`, `/en/*`): el
 * middleware lo resuelve y lo pasa como `serverLocale` para que el PRIMER
 * render del server salga en el idioma correcto (clave para crawlers). En
 * cliente se lee del primer segmento del `pathname` — reacciona a la
 * navegación entre idiomas incluso viviendo en el layout raíz (por encima del
 * segmento `[locale]`), donde `useParams()` no siempre reacciona.
 *
 * `t` viene de `lib/i18n/dictionary` (función pura, síncrona). Reemplazó a
 * i18next/react-i18next el 2026-08-29 — ver el docblock de ese archivo.
 * Ver portfolio: planes/i18n-jevy-navegador-y-crawlers-2026-08-28 (Parte C).
 */
export type LanguageCode = "es" | "en" | "it" | "fr"

export type Language = {
  code: LanguageCode
  name: string
  flag: string
}

export const languages: Language[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
]

export const ROUTABLE_LOCALES: LanguageCode[] = ["es", "en", "fr", "it"]
const DEFAULT_LOCALE: LanguageCode = "es"

function normalizeLocale(value: unknown): LanguageCode | null {
  return typeof value === "string" && ROUTABLE_LOCALES.includes(value as LanguageCode)
    ? (value as LanguageCode)
    : null
}

export type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: TranslateFn
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({
  children,
  serverLocale,
}: {
  children: ReactNode
  serverLocale?: string
}) => {
  const router = useRouter()
  const pathname = usePathname() || "/"

  const locale: LanguageCode =
    normalizeLocale(pathname.split("/")[1]) ?? normalizeLocale(serverLocale) ?? DEFAULT_LOCALE

  const t = useMemo(() => getTranslator(locale), [locale])
  const language = useMemo(() => languages.find((l) => l.code === locale) ?? languages[0], [locale])

  const setLanguage = useCallback(
    (newLanguage: Language) => {
      if (newLanguage.code === locale) return
      try {
        document.cookie = `NEXT_LOCALE=${newLanguage.code}; path=/; max-age=31536000; samesite=lax`
      } catch {
      }
      const seg = pathname.split("/")[1]
      const rest = ROUTABLE_LOCALES.includes(seg as LanguageCode) ? pathname.slice(seg.length + 1) : pathname
      router.push(`/${newLanguage.code}${rest || ""}`)
    },
    [locale, pathname, router],
  )

  const value = useMemo<LanguageContextType>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

"use client"

import { createContext, useState, useContext, useEffect, useMemo, type ReactNode } from "react"
import { createInstance, type i18n as I18nInstance } from "i18next"
import { I18nextProvider, initReactI18next, useTranslation } from "react-i18next"
import { useParams, usePathname, useRouter } from "next/navigation"
import esTranslation from "@/public/locales/es/translation.json"
import enTranslation from "@/public/locales/en/translation.json"
import frTranslation from "@/public/locales/fr/translation.json"
import itTranslation from "@/public/locales/it/translation.json"

/**
 * Provider de idioma. El idioma lo manda la URL (`/es/*`, `/en/*`) — el
 * middleware lo resuelve y lo pasa como `serverLocale` para que el PRIMER
 * render del server ya salga en el idioma correcto (clave para crawlers).
 * En cliente, el locale se lee de `useParams()` para reaccionar a la
 * navegación entre idiomas. Se usa una instancia de i18next PROPIA por
 * render (createInstance), no el singleton del módulo — así no hay carrera
 * entre requests concurrentes de idiomas distintos.
 * Ver portfolio: planes/i18n-jevy-navegador-y-crawlers-2026-08-28 (Parte C, Stage 2).
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

// Idiomas con rutas reales.
export const ROUTABLE_LOCALES: LanguageCode[] = ["es", "en", "fr", "it"]
const DEFAULT_LOCALE: LanguageCode = "es"

const RESOURCES = {
  es: { translation: esTranslation },
  en: { translation: enTranslation },
  fr: { translation: frTranslation },
  it: { translation: itTranslation },
}

function buildI18n(locale: LanguageCode): I18nInstance {
  const instance = createInstance()
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    resources: RESOURCES,
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    initImmediate: false, // init síncrono: todos los recursos ya están embebidos
  })
  return instance
}

function normalizeLocale(value: unknown): LanguageCode | null {
  return typeof value === "string" && ROUTABLE_LOCALES.includes(value as LanguageCode)
    ? (value as LanguageCode)
    : null
}

export type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, options?: any) => string | object
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({
  children,
  serverLocale,
}: {
  children: ReactNode
  serverLocale?: string
}) => {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname() || "/"

  const locale: LanguageCode =
    normalizeLocale(params?.locale) ?? normalizeLocale(serverLocale) ?? DEFAULT_LOCALE

  // Una instancia por vida del provider (por render en server, por mount en cliente).
  const [i18nInstance] = useState(() => buildI18n(locale))

  // Navegación entre idiomas en cliente: el locale de la URL cambió → sincronizar.
  useEffect(() => {
    if (i18nInstance.language !== locale) i18nInstance.changeLanguage(locale)
  }, [locale, i18nInstance])

  const language = useMemo(
    () => languages.find((l) => l.code === locale) ?? languages[0],
    [locale],
  )

  const setLanguage = (newLanguage: Language) => {
    if (newLanguage.code === locale) return
    try {
      document.cookie = `NEXT_LOCALE=${newLanguage.code}; path=/; max-age=31536000; samesite=lax`
    } catch {
      /* cookies bloqueadas: igual navega */
    }
    // Misma ruta, otro prefijo de idioma.
    const seg = pathname.split("/")[1]
    const rest = ROUTABLE_LOCALES.includes(seg as LanguageCode)
      ? pathname.slice(seg.length + 1)
      : pathname
    router.push(`/${newLanguage.code}${rest || ""}`)
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      <LanguageBridge language={language} setLanguage={setLanguage}>
        {children}
      </LanguageBridge>
    </I18nextProvider>
  )
}

/** Expone `t` del `I18nextProvider` de arriba por el `LanguageContext` que ya usa todo el sitio. */
function LanguageBridge({
  children,
  language,
  setLanguage,
}: {
  children: ReactNode
  language: Language
  setLanguage: (language: Language) => void
}) {
  const { t } = useTranslation()
  const value: LanguageContextType = {
    language,
    setLanguage,
    t: (key, options) => t(key, options as never),
  }
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

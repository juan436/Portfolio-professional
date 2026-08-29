"use client"

import { createContext, useState, useContext, useMemo, type ReactNode } from "react"
import { createInstance, type i18n as I18nInstance } from "i18next"
import { I18nextProvider, initReactI18next, useTranslation } from "react-i18next"
import { usePathname, useRouter } from "next/navigation"
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
  const router = useRouter()
  const pathname = usePathname() || "/"

  // El locale se saca del primer segmento del pathname (el middleware garantiza
  // el prefijo `/es|en|fr|it/...`). Se usaba `useParams().locale`, pero este
  // provider vive en el layout raíz —por encima del segmento `[locale]`— y ahí
  // `useParams()` no siempre reacciona al navegar entre valores hermanos del
  // segmento; `usePathname()` sí. `serverLocale` (header `x-locale`) es el
  // fallback para el primer render en server.
  const locale: LanguageCode =
    normalizeLocale(pathname.split("/")[1]) ?? normalizeLocale(serverLocale) ?? DEFAULT_LOCALE

  // El locale lo manda la URL. Cambiar de idioma es una navegación que remonta
  // el subárbol de `[locale]` pero NO este provider (vive en el layout raíz).
  // Antes se hacía `changeLanguage` en un `useEffect`: ese efecto corre DESPUÉS
  // de que los hijos ya memoizaron su texto con el `t` viejo → traducciones un
  // paso atrás (bug real: cambiar EN→ES no hacía nada y el siguiente cambio
  // mostraba el idioma anterior). Con los 4 idiomas embebidos `buildI18n` es
  // síncrono, así que se recrea la instancia para el locale actual en el render
  // (patrón de React para resetear estado cuando cambia una prop) — `t` ya sale
  // bien en este mismo render, sin lag.
  const [i18nState, setI18nState] = useState(() => ({ locale, instance: buildI18n(locale) }))
  if (i18nState.locale !== locale) {
    setI18nState({ locale, instance: buildI18n(locale) })
  }
  const i18nInstance = i18nState.instance

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

  // `key={locale}`: al cambiar de idioma la instancia de i18next se recrea
  // (arriba), pero `useTranslation` de react-i18next actualiza su `t` interno
  // por un `useEffect` — va un render atrás cuando la instancia cambia en
  // caliente. Con la key, todo el subárbol (incluido el navbar del layout raíz,
  // que si no nunca remonta) se re-monta con la instancia nueva y el `t`
  // correcto de una. El subárbol de `[locale]` ya remonta por navegación; esto
  // solo agrega el chrome del layout raíz.
  return (
    <I18nextProvider i18n={i18nInstance} key={locale}>
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

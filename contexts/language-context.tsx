"use client"

import { createContext, useState, useContext, type ReactNode, useEffect } from "react"
import i18next from "i18next"
import { initReactI18next, useTranslation } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import Backend from "i18next-http-backend"

// Definir los idiomas disponibles
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

// Inicializar i18next
i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    },
    // Cargamos los recursos desde la carpeta public/locales
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  }).then(() => {
  });

// Crear el contexto
export type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, options?: any) => string | object
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Crear el proveedor
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar con el idioma detectado o el primero de la lista
  const [language, setLanguage] = useState<Language>(() => {
    const detectedLng = i18next.language;
    const foundLang = languages.find(lang => lang.code === detectedLng);
    return foundLang || languages[0];
  });
  
  const { t, i18n } = useTranslation()

  // Cambiar el idioma en i18next cuando cambia el idioma en el contexto
  useEffect(() => {
    i18n.changeLanguage(language.code)
  }, [language, i18n])

  // Función para cambiar el idioma
  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  // Función para obtener traducciones con soporte para opciones
  const translate = (key: string, options?: any): string | object => {
    return t(key, options)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}


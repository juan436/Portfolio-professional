"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/hooks/use-language"

/**
 * Reemplaza el patrón repetido "useState(objeto vacío) + useEffect que llena
 * las traducciones tras la hidratación" — mismo comportamiento, un solo lugar.
 */
export function useTranslatedTexts<T>(
  build: (t: (key: string, options?: unknown) => string | object) => T,
  initial: T,
  extraDeps: unknown[] = []
): T {
  const { t, language } = useLanguage()
  const [translatedTexts, setTranslatedTexts] = useState<T>(initial)

  useEffect(() => {
    setTranslatedTexts(build(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, language, ...extraDeps])

  return translatedTexts
}

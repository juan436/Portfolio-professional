"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/hooks/use-language"

/**
 * Reemplaza el patrón repetido "useState(objeto vacío) + useEffect que llena
 * las traducciones tras la hidratación" — mismo comportamiento, un solo lugar.
 * @param build - Arma el objeto de textos a partir de `t`.
 * @param initial - Valor devuelto antes de que el efecto corra (primer render).
 * @param extraDeps - Dependencias extra para recalcular, además de `t`/`language`.
 * @returns `T` — el objeto de textos, recalculado cuando cambian `t`/`language`/`extraDeps`.
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

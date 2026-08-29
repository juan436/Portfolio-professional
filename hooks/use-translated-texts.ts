"use client"

import { useMemo } from "react"
import { useLanguage } from "@/hooks/use-language"
import type { TranslateFn } from "@/lib/i18n/dictionary"

/**
 * Arma un objeto de textos traducidos a partir de `t`, de forma SÍNCRONA
 * (durante el render). Antes era `useState(inicial) + useEffect` para evitar
 * mismatch de hidratación cuando las traducciones cargaban async — ya no hace
 * falta: los 4 idiomas van embebidos y el locale lo fija la URL en el server
 * (ver portfolio: planes/i18n-jevy-navegador-y-crawlers-2026-08-28, Parte C).
 * Devolver el texto en el primer render es lo que hace que los crawlers lo vean.
 * @param build - Arma el objeto de textos a partir de `t`.
 * @param _initial - (Ignorado; se mantiene la firma por compatibilidad con los call sites.)
 * @param extraDeps - Dependencias extra para recalcular, además del idioma.
 */
export function useTranslatedTexts<T>(
  build: (t: TranslateFn) => T,
  _initial: T,
  extraDeps: unknown[] = []
): T {
  const { t, language } = useLanguage()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => build(t), [language.code, ...extraDeps])
}

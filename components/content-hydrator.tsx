"use client"

import { useLayoutEffect, useRef } from "react"
import { useContent } from "@/contexts/content"
import type { Content } from "@/contexts/content/types"

/**
 * Inyecta datos ya resueltos server-side al ContentProvider antes del primer
 * paint (useLayoutEffect corre antes que el useEffect de fetch del Provider,
 * dentro del mismo commit — ver content-provider.tsx). Sin esto, cada página
 * que usa useContent() ve el estado vacío hasta que el fetch client-side
 * termina.
 * Recibe: `full` (Content completo, home) o `partial` (solo una sección, ej. /contact).
 * Produce: `null` — solo dispara `hydrateContent`/`hydratePartial` una vez, no renderiza nada.
 */
export function ContentHydrator({ full, partial }: { full?: Content; partial?: Partial<Content> }) {
  const { hydrateContent, hydratePartial } = useContent()
  const done = useRef(false)

  useLayoutEffect(() => {
    if (done.current) return
    done.current = true
    if (full) hydrateContent(full)
    else if (partial) hydratePartial(partial)
  }, [])

  return null
}

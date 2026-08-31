"use client"

import { useLayoutEffect, useRef } from "react"
import { useContent } from "@/contexts/content"
import type { Content } from "@/contexts/content/types"

/**
 * Inyecta al `ContentProvider` el contenido ya resuelto server-side, antes del
 * primer paint (`useLayoutEffect`). Se monta una vez en `app/[locale]/layout.tsx`
 * (sitio público) y en `app/admin/layout.tsx` (preview de imágenes).
 * Recibe: `full` (Content completo).
 * Produce: `null` — solo dispara `hydrateContent` una vez.
 */
export function ContentHydrator({ full }: { full: Content }) {
  const { hydrateContent } = useContent()
  const done = useRef(false)

  useLayoutEffect(() => {
    if (done.current) return
    done.current = true
    hydrateContent(full)
  }, [])

  return null
}

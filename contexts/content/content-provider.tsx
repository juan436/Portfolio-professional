"use client"

import { useState, type ReactNode } from "react"
import ContentContext, { ContentContextType } from "./content-context"
import { Content } from "./types"
import { emptyContent } from "./empty-content"

/**
 * Provider de contenido del sitio público (home, /work, /contact, Footer y el
 * preview de imágenes del Admin).
 * Recibe: `children`.
 * Procesa: nada — el contenido llega ya resuelto server-side vía `<ContentHydrator>`,
 *   montado en `app/[locale]/layout.tsx` y `app/admin/layout.tsx`.
 * Produce: `ContentContext.Provider`.
 *
 * Antes esto hacía 7 fetches client-side al montar + `assembleContent`. Se
 * eliminó (2026-08-31): había dos mapeos del mismo contenido (este y
 * `lib/data/home-content.ts`) que se desincronizaron — las cards de proyecto
 * llegaron a enlazar al `_id` en vez del slug. Ahora hay un solo camino: lectura
 * server-side.
 */
export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<Content>(emptyContent)
  const [isLoading, setIsLoading] = useState(true)

  const hydrateContent = (initial: Content) => {
    setContent(initial)
    setIsLoading(false)
  }

  const contextValue: ContentContextType = { content, isLoading, hydrateContent }

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  )
}

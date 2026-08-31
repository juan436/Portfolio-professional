"use client"

import { createContext, useContext } from "react"
import { Content } from "./types"

/**
 * Definición del contexto de contenido (forma del value, sin implementación).
 * Recibe: nada.
 * Produce: `ContentContextType` (content/isLoading/hydrateContent) + el `ContentContext` de React.
 */
// El contenido del sitio público se lee 100% server-side (lib/data/home-content)
// y se inyecta acá con `<ContentHydrator>`. Las mutaciones viven en Server
// Actions (lib/actions/*.ts). Ver vault/portfolio: planes/rediseno-admin-server-actions.
export type ContentContextType = {
  content: Content
  isLoading: boolean
  hydrateContent: (initial: Content) => void
}

// Crear el contexto
const ContentContext = createContext<ContentContextType | undefined>(undefined)

export default ContentContext

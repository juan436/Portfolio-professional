"use client"

import { createContext, useContext } from "react"
import { Content } from "./types"

/**
 * Definición del contexto de contenido (forma del value, sin implementación).
 * Recibe: nada.
 * Produce: `ContentContextType` (content/isLoading/hydrateContent/hydratePartial) + el `ContentContext` de React.
 */
export type ContentContextType = {
  content: Content
  isLoading: boolean

  hydrateContent: (initial: Content) => void
  hydratePartial: (partial: Partial<Content>) => void
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export default ContentContext

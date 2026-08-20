"use client"

import { createContext, useContext } from "react"
import { Content } from "./types"

// ContentProvider quedó como caché de lectura para el sitio público (home,
// Footer, /contact) — todas las mutaciones (Proyectos, Testimonios, Métricas,
// Certificados, Blog, Skills, Experiencia, Hero/About/Servicios/Contacto)
// migraron a Server Actions (lib/actions/*.ts). Ver
// vault/portfolio: planes/rediseno-admin-server-actions.
export type ContentContextType = {
  // Estado global
  content: Content
  isLoading: boolean

  // Hidratación server-side (ver content-provider.tsx)
  hydrateContent: (initial: Content) => void
  hydratePartial: (partial: Partial<Content>) => void
}

// Crear el contexto
const ContentContext = createContext<ContentContextType | undefined>(undefined)

export default ContentContext

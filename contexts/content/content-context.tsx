"use client"

import { createContext, useContext } from "react"
import { Projects, Skills, Content } from "./types"

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

  // Legacy, sin consumidores reales (bulk-replace de una sección completa,
  // reemplazado por CRUD item-a-item vía Server Actions) — se deja por ahora,
  // candidato a Fase 5 (cleanup)
  updateProjects: (projects: Projects) => void
  updateSkills: (skills: Skills) => void
}

// Crear el contexto
const ContentContext = createContext<ContentContextType | undefined>(undefined)

export default ContentContext

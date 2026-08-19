// Re-exportar todo desde un único punto de entrada

// Exportar el contexto y el hook principal
export { default as ContentContext } from './content-context'
export { useContent } from './use-content'
export { ContentProvider } from './content-provider'

// Exportar tipos
export * from './types'

// Acciones legacy sin consumidores reales (updateProjects/updateSkills
// bulk-replace) — hero/about/services/otherSkills/experience/contact
// migraron a Server Actions (lib/actions/*.ts), sus slices se borraron en
// Fase 5. Ver vault/portfolio: planes/rediseno-admin-server-actions.
export * from './slices/projects/actions'
export * from './slices/skills/actions'

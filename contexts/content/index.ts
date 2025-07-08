// Re-exportar todo desde un único punto de entrada

// Exportar el contexto y el hook principal
export { default as ContentContext } from './content-context'
export { useContent } from './use-content'
export { ContentProvider } from './content-provider'

// Exportar tipos
export * from './types'

// Exportar acciones por entidad
export * from './slices/hero/actions'
export * from './slices/about/actions'
export * from './slices/services/actions'
export * from './slices/projects/actions'
export * from './slices/skills/actions'
export * from './slices/otherSkills/actions'
export * from './slices/experience/actions'
export * from './slices/contact/actions'

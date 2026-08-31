import type { Content } from "./types"

/**
 * `Content` vacío — estado inicial del `ContentProvider` antes de que el
 * `ContentHydrator` inyecte los datos server-side, y fallback por sección en
 * `lib/data/home-content.ts` cuando el documento aún no existe.
 * Recibe: nada. Produce: un `Content` con todas las secciones en cero.
 */
export const emptyContent: Content = {
  hero: { title: "", subtitle: "", description: "", profileImage: "", translations: {} },
  about: { paragraph1: "", paragraph2: "", paragraph3: "", translations: {} },
  services: [],
  projects: { web: [], mobile: [], infra_backend: [] },
  skills: { frontend: [], backend: [], database: [], devops: [] },
  otherSkills: [],
  contact: { email: "", phone: "", location: "", translations: {} },
  experience: [],
}

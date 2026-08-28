import type { Content } from "@/contexts/content/types"

/**
 * Ensambla el objeto `Content` a partir de las respuestas crudas de los 7
 * fetches del sitio público. Función pura — extraída del `useEffect` de
 * `content-provider.tsx` (§2.5 auditoría 2026-08-27), que tenía ~90 líneas de
 * mapeo inline (`translations || {}` campo por campo, 6 veces).
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

const withTranslations = <T extends { translations?: unknown }>(item: T) => ({
  ...item,
  translations: item.translations || {},
})

const mapProject = (p: any) => ({
  id: p._id,
  slug: p.slug,
  title: p.title,
  description: p.description,
  image: p.image,
  images: p.images || [],
  tags: p.tags || [],
  subtype: p.subtype,
  github: p.github || "#",
  demo: p.demo || "#",
  createdAt: p.createdAt,
  testimonial: p.testimonial,
  techStack: p.techStack,
  challenge: p.challenge,
  technicalDecisions: p.technicalDecisions || [],
  securityHardening: p.securityHardening || [],
  deploymentDiagram: p.deploymentDiagram || [],
  translations: p.translations || {},
})

export interface RawContentSources {
  contentData: any
  webProjects: any[]
  mobileProjects: any[]
  infraBackendProjects: any[]
  experienceData: any[]
  skillsData: any
  otherSkillsData: { data?: any[] }
}

export function assembleContent(raw: RawContentSources): Content {
  const { contentData } = raw
  if (!contentData) return emptyContent

  return {
    hero: contentData.hero ? withTranslations(contentData.hero) : emptyContent.hero,
    about: contentData.about ? withTranslations(contentData.about) : emptyContent.about,
    services: (contentData.services || []).map(withTranslations),
    projects: {
      web: raw.webProjects.map(mapProject),
      mobile: raw.mobileProjects.map(mapProject),
      infra_backend: raw.infraBackendProjects.map(mapProject),
    },
    skills: {
      frontend: (raw.skillsData?.frontend || []).map(withTranslations),
      backend: (raw.skillsData?.backend || []).map(withTranslations),
      database: (raw.skillsData?.database || []).map(withTranslations),
      devops: (raw.skillsData?.devops || []).map(withTranslations),
    },
    otherSkills: (raw.otherSkillsData.data || []).map(withTranslations),
    contact: contentData.contact ? withTranslations(contentData.contact) : emptyContent.contact,
    experience: (raw.experienceData || []).map(withTranslations),
  }
}

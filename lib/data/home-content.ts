import { unstable_cache } from "next/cache"
import dbConnect from "@/lib/db/conection"
import Content from "@/models/content.model"
import Project from "@/models/project.model"
import Experience from "@/models/experience.model"
import Skill from "@/models/skill.model"
import OtherSkill from "@/models/other-skills.model"
import type { Content as ContentShape } from "@/contexts/content/types"

/**
 * Lectura server-only del contenido de home directo a Mongo (sin round-trip HTTP).
 * Recibe: nada.
 * Produce: `getHomeContent()` (Content completo, mismo shape que `ContentProvider`)
 * y `getContactInfo()` (solo el sub-objeto `contact`, para `/contact`).
 */
const emptyContent: ContentShape = {
  hero: { title: "", subtitle: "", description: "", profileImage: "", translations: {} },
  about: { paragraph1: "", paragraph2: "", paragraph3: "", translations: {} },
  services: [],
  projects: { web: [], mobile: [], infra_backend: [] },
  skills: { frontend: [], backend: [], database: [], devops: [] },
  otherSkills: [],
  contact: { email: "", phone: "", location: "", translations: {} },
  experience: [],
}

function mapProject(p: any) {
  return {
    id: p._id,
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
  }
}

async function fetchHomeContent(): Promise<ContentShape> {
  await dbConnect()

  const [contentDoc, webProjects, mobileProjects, infraBackendProjects, experienceDocs, skillDocs, otherSkillDocs] =
    await Promise.all([
      Content.findOne().sort({ createdAt: -1 }).lean(),
      Project.find({ category: "web" }).sort({ createdAt: 1 }).lean(),
      Project.find({ category: "mobile" }).sort({ createdAt: 1 }).lean(),
      Project.find({ category: "infra_backend" }).sort({ createdAt: 1 }).lean(),
      Experience.find().sort({ createdAt: -1 }).lean(),
      Skill.find().sort({ name: 1 }).lean(),
      OtherSkill.find().lean(),
    ])

  const contentData = contentDoc as any

  const byCategory = (category: string) =>
    (skillDocs as any[])
      .filter((s) => s.category === category)
      .map((s) => ({ ...s, translations: s.translations || {} }))

  const result: ContentShape = {
    hero: contentData?.hero
      ? { ...contentData.hero, translations: contentData.hero.translations || {} }
      : emptyContent.hero,
    about: contentData?.about
      ? { ...contentData.about, translations: contentData.about.translations || {} }
      : emptyContent.about,
    services: contentData?.services?.map((s: any) => ({ ...s, translations: s.translations || {} })) || [],
    projects: {
      web: (webProjects as any[]).map(mapProject),
      mobile: (mobileProjects as any[]).map(mapProject),
      infra_backend: (infraBackendProjects as any[]).map(mapProject),
    },
    skills: {
      frontend: byCategory("frontend"),
      backend: byCategory("backend"),
      database: byCategory("database"),
      devops: byCategory("devops"),
    },
    otherSkills: (otherSkillDocs as any[]).map((s) => ({ ...s, translations: s.translations || {} })),
    contact: contentData?.contact
      ? { ...contentData.contact, translations: contentData.contact.translations || {} }
      : emptyContent.contact,
    experience: (experienceDocs as any[]).map((e) => ({ ...e, translations: e.translations || {} })),
  }

  return JSON.parse(JSON.stringify(result))
}

export const getHomeContent = unstable_cache(fetchHomeContent, ["home-content"], {
  tags: ["home"],
  revalidate: 3600,
})

async function fetchContactInfo(): Promise<ContentShape["contact"] | null> {
  await dbConnect()
  const contentDoc = await Content.findOne().sort({ createdAt: -1 }).select("contact").lean()
  const contact = (contentDoc as any)?.contact
  if (!contact) return null
  return JSON.parse(JSON.stringify({ ...contact, translations: contact.translations || {} }))
}

export const getContactInfo = unstable_cache(fetchContactInfo, ["contact-info"], {
  tags: ["home"],
  revalidate: 3600,
})

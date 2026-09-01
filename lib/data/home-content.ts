import { unstable_cache } from "next/cache"
import dbConnect from "@/lib/db/conection"
import Content from "@/models/content.model"
import Project from "@/models/project.model"
import Experience from "@/models/experience.model"
import Skill from "@/models/skill.model"
import OtherSkill from "@/models/other-skills.model"
import Testimonial from "@/models/testimonial.model"
import type { Content as ContentShape } from "@/contexts/content/types"
import { emptyContent } from "@/contexts/content/empty-content"
import { buildSafe } from "@/lib/data/build-safe"

/**
 * Lectura server-only del contenido del sitio, directo a Mongo. Es el ÚNICO
 * camino de lectura del contenido público: `app/[locale]/layout.tsx` llama a
 * `getHomeContent()` y lo inyecta con `<ContentHydrator>` para todas las páginas.
 * Recibe: nada.
 * Produce: `getHomeContent()` (Content completo) + `getApprovedTestimonials()`.
 */

// `id` guarda el _id de Mongo (tipo preexistente, no se toca). `slug` es
// imprescindible: las cards enlazan a `/projects/${slug || id}` y sin slug el
// link cae al _id, que la página de detalle (busca por slug) no resuelve.
function mapProject(p: any) {
  return {
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
  }
}

// Todo el contenido del sitio en paralelo, directo a Mongo. Antes esto lo hacía
// el navegador con 7 fetches + assembleContent; se unificó acá (2026-08-31).
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

// Cacheado (unstable_cache): una sola consulta a Mongo por hora, reusada por
// todas las páginas. Se invalida con `revalidateTag("home")` desde las Server
// Actions del Admin. `revalidate: 3600` = red de seguridad.
export const getHomeContent = unstable_cache(() => buildSafe(fetchHomeContent, emptyContent), ["home-content"], {
  tags: ["home"],
  revalidate: 3600,
})

// Server-only: testimonios aprobados para el carrusel "Casos de Éxito
// Verificados" del home. Antes esa sección leía 4 testimonios ficticios
// hardcodeados en los translation.json (`testimonials.items`); ahora sale de
// la misma colección `Testimonial` que las fichas de proyecto — con la BD
// vacía, la sección no se muestra (y el CTA del Hero se oculta). Se invalida
// con `revalidateHomeTestimonials()` desde el CRUD de Admin.
export interface HomeTestimonial {
  content: string
  author: string
  role: string
  avatar: string
}

async function fetchApprovedTestimonials(): Promise<HomeTestimonial[]> {
  await dbConnect()
  const docs = await Testimonial.find({ status: "approved" }).sort({ createdAt: -1 }).lean()
  return (docs as any[]).map((t) => ({
    content: t.content,
    author: t.author,
    role: t.role || "",
    avatar: t.photo || "",
  }))
}

export const getApprovedTestimonials = unstable_cache(() => buildSafe(fetchApprovedTestimonials, [] as HomeTestimonial[]), ["approved-testimonials"], {
  tags: ["home", "testimonials"],
  revalidate: 3600,
})

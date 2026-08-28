import { MetadataRoute } from 'next'
import { getBlogPosts } from '@/lib/data/blog'
import { getProjectsByCategory } from '@/lib/data/projects'
import { getCertificatesList } from '@/lib/data/certificates'
import { SITE_URL } from '@/lib/site-config'

/**
 * Sitemap XML del sitio (`app/sitemap.ts` → `/sitemap.xml`).
 * Recibe: nada.
 * Produce: rutas fijas indexables + todos los slugs de detalle (proyectos/
 * automatizaciones/agentes/laboratorio/certificados) + los posts de blog.
 * `lastModified` real por doc (`updatedAt`/`date`). Excluye `/admin`, `/api`,
 * `/testimonial` (noindex), `/projects` (redirige a `/work`) y `/agents`
 * (redirige a `/work#agents`).
 */
const BASE = SITE_URL

// category del modelo Project → prefijo de ruta pública de detalle
const CATEGORY_ROUTES: Record<string, string> = {
  web: '/projects',
  infra_backend: '/projects',
  mobile: '/projects',
  automatizacion: '/automations',
  agente: '/agents',
  laboratorio: '/laboratory',
}

type Doc = { slug?: string; updatedAt?: string; createdAt?: string; date?: string }

function lastMod(doc: Doc, fallback: Date): Date {
  const raw = doc.updatedAt || doc.date || doc.createdAt
  return raw ? new Date(raw) : fallback
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const categories = Object.keys(CATEGORY_ROUTES)
  const [posts, certificates, ...projectBuckets] = await Promise.all([
    getBlogPosts(),
    getCertificatesList(),
    ...categories.map((c) => getProjectsByCategory(c)),
  ])

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/automations`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/laboratory`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/certificates`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const projectEntries: MetadataRoute.Sitemap = categories.flatMap((category, i) =>
    (projectBuckets[i] as Doc[])
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${BASE}${CATEGORY_ROUTES[category]}/${p.slug}`,
        lastModified: lastMod(p, now),
        changeFrequency: 'monthly' as const,
        priority: category === 'laboratorio' ? 0.5 : 0.7,
      }))
  )

  const certificateEntries: MetadataRoute.Sitemap = (certificates as Doc[])
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${BASE}/certificates/${c.slug}`,
      lastModified: lastMod(c, now),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    }))

  const postEntries: MetadataRoute.Sitemap = (posts as Doc[]).map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: lastMod(post, now),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...projectEntries, ...certificateEntries, ...postEntries]
}

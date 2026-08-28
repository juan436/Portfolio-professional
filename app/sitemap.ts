import { MetadataRoute } from 'next'
import { getBlogPosts } from '@/lib/data/blog'
import { getProjectsByCategory } from '@/lib/data/projects'
import { getCertificatesList } from '@/lib/data/certificates'
import { SITE_URL } from '@/lib/site-config'

/**
 * Sitemap XML del sitio (`app/sitemap.ts` → `/sitemap.xml`).
 * Recibe: nada.
 * Produce: cada ruta indexable × 4 idiomas (`/es/…`, `/en/…`, `/fr/…`, `/it/…`)
 * con `alternates.languages` (hreflang) apuntando a las 4 versiones + `x-default`.
 * `lastModified` real por doc. Excluye `/admin`, `/api`, `/testimonial` (noindex),
 * `/projects` y `/agents` (redirects).
 * Ver portfolio: planes/i18n-jevy-navegador-y-crawlers-2026-08-28 (Stage 3).
 */
const BASE = SITE_URL
const LOCALES = ['es', 'en', 'fr', 'it'] as const

/** Una entrada por idioma para un path base (`/work`, `/projects/x`), cada una con hreflang a las 4. */
function localizedEntries(
  path: string,
  lastModified: Date,
  changeFrequency: 'weekly' | 'monthly' | 'yearly',
  priority: number,
): MetadataRoute.Sitemap {
  const clean = path === '/' ? '' : path
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l] = `${BASE}/${l}${clean}`
  languages['x-default'] = `${BASE}/es${clean}`
  return LOCALES.map((l) => ({
    url: `${BASE}/${l}${clean}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }))
}

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
    ...localizedEntries('/', now, 'monthly', 1),
    ...localizedEntries('/work', now, 'monthly', 0.9),
    ...localizedEntries('/automations', now, 'monthly', 0.8),
    ...localizedEntries('/laboratory', now, 'monthly', 0.6),
    ...localizedEntries('/certificates', now, 'yearly', 0.6),
    ...localizedEntries('/contact', now, 'yearly', 0.7),
    ...localizedEntries('/blog', now, 'weekly', 0.7),
  ]

  const projectEntries: MetadataRoute.Sitemap = categories.flatMap((category, i) =>
    (projectBuckets[i] as Doc[])
      .filter((p) => p.slug)
      .flatMap((p) =>
        localizedEntries(
          `${CATEGORY_ROUTES[category]}/${p.slug}`,
          lastMod(p, now),
          'monthly',
          category === 'laboratorio' ? 0.5 : 0.7,
        ),
      )
  )

  const certificateEntries: MetadataRoute.Sitemap = (certificates as Doc[])
    .filter((c) => c.slug)
    .flatMap((c) => localizedEntries(`/certificates/${c.slug}`, lastMod(c, now), 'yearly', 0.4))

  const postEntries: MetadataRoute.Sitemap = (posts as Doc[]).flatMap((post) =>
    localizedEntries(`/blog/${post.slug}`, lastMod(post, now), 'monthly', 0.6),
  )

  return [...staticEntries, ...projectEntries, ...certificateEntries, ...postEntries]
}

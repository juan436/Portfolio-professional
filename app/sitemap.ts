import { MetadataRoute } from 'next'
import { getBlogPosts } from '@/lib/data/blog'

/**
 * Sitemap XML del sitio (convención Next.js — `app/sitemap.ts` → `/sitemap.xml`).
 * Recibe: nada.
 * Produce: `MetadataRoute.Sitemap` con las rutas principales fijas + `/blog` y sus slugs publicados
 * (el resto de entidades con slug dinámico — projects/automations/agents/laboratory/certificates —
 * queda fuera, es un gap general preexistente, no propio del blog).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = 'https://jevy.dev'
  const currentDate = new Date()

  const posts = await getBlogPosts()

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseURL,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseURL}/projects`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseURL}/automations`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseURL}/agents`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseURL}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  const postEntries: MetadataRoute.Sitemap = posts.map((post: { slug: string; updatedAt?: string; publishedAt?: string }) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : post.publishedAt ? new Date(post.publishedAt) : currentDate,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...postEntries]
}

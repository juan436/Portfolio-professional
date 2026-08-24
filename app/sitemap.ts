import { MetadataRoute } from 'next'

/**
 * Sitemap XML del sitio (convención Next.js — `app/sitemap.ts` → `/sitemap.xml`).
 * Recibe: nada.
 * Produce: `MetadataRoute.Sitemap` con las rutas principales fijas (no incluye slugs dinámicos).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseURL = 'https://jevy.dev'
  
  const currentDate = new Date()

  return [
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
  ]
}

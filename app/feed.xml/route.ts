import { getBlogPosts } from "@/lib/data/blog"
import { SITE_URL, AUTHOR_NAME, AUTHOR_DISPLAY_NAME } from "@/lib/site-config"

/**
 * Feed RSS 2.0 del blog — `/feed.xml` (convención de lectores de feeds).
 * Recibe: nada.
 * Produce: XML con un `<item>` por post publicado (solo la versión ES, coherente
 * con que los crawlers hoy solo ven ES). Autodescubrible vía `<link rel="alternate">`
 * en el `<head>` del layout raíz.
 */
export const dynamic = 'force-dynamic'

function escapeXml(text: string): string {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const posts = await getBlogPosts()

  const items = posts
    .map((post: { title: string; slug: string; excerpt: string; publishedAt?: string; updatedAt?: string }) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      const date = post.publishedAt || post.updatedAt
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      ${date ? `<pubDate>${new Date(date).toUTCString()}</pubDate>` : ""}
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog — ${AUTHOR_DISPLAY_NAME}</title>
    <link>${SITE_URL}/blog</link>
    <description>Artículos técnicos y aprendizajes reales de los proyectos de ${AUTHOR_NAME}.</description>
    <language>es</language>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}

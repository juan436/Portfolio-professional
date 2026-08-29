import { SITE_URL, AUTHOR_NAME, AUTHOR_DISPLAY_NAME } from "@/lib/site-config"

/**
 * Structured data del listado `/blog`.
 * Recibe: `posts` (los publicados, para enumerarlos).
 * Produce: un `@graph` con `Blog` (nombre/url + `blogPost[]`) + `BreadcrumbList`
 * (Inicio › Blog) — le dice a Google que esto es un blog y cuáles son sus artículos.
 */
export function BlogJsonLd({
  posts,
  locale = "es",
  homeLabel = "Inicio",
}: {
  posts: { title: string; slug: string; excerpt: string; publishedAt?: string }[]
  locale?: string
  homeLabel?: string
}) {
  const base = `${SITE_URL}/${locale}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        name: `Blog — ${AUTHOR_DISPLAY_NAME}`,
        url: `${base}/blog`,
        inLanguage: locale,
        author: { "@type": "Person", name: AUTHOR_NAME, url: `${SITE_URL}/` },
        blogPost: posts.slice(0, 20).map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          url: `${base}/blog/${post.slug}`,
          ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabel, item: base },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` },
        ],
      },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

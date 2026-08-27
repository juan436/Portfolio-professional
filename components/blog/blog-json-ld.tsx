import Script from "next/script"

/**
 * Structured data del listado `/blog`.
 * Recibe: `posts` (los publicados, para enumerarlos).
 * Produce: un `@graph` con `Blog` (nombre/url + `blogPost[]`) + `BreadcrumbList`
 * (Inicio › Blog) — le dice a Google que esto es un blog y cuáles son sus artículos.
 */
const SITE_URL = "https://jevy.dev"

export function BlogJsonLd({
  posts,
}: {
  posts: { title: string; slug: string; excerpt: string; publishedAt?: string }[]
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        name: "Blog — Ing. Juan Villegas",
        url: `${SITE_URL}/blog`,
        inLanguage: "es",
        author: { "@type": "Person", name: "Juan Villegas", url: `${SITE_URL}/` },
        blogPost: posts.slice(0, 20).map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          url: `${SITE_URL}/blog/${post.slug}`,
          ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        ],
      },
    ],
  }

  return (
    <Script
      id="blog-json-ld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

import { SITE_URL, AUTHOR_NAME, AUTHOR_PHOTO } from "@/lib/site-config"

/**
 * Structured data de un post de blog, inyectado como `<script type="application/ld+json">`.
 * Recibe: `post` (title/excerpt/slug/coverImage/publishedAt/updatedAt).
 * Produce: un `@graph` con `BlogPosting` (headline, fechas, autor con imagen,
 * publisher, mainEntityOfPage) + `BreadcrumbList` (Inicio › Blog › Artículo)
 * para que Google muestre la ruta en el resultado de búsqueda.
 */

export function BlogPostingJsonLd({
  post,
}: {
  post: { title: string; excerpt: string; slug: string; coverImage?: string; publishedAt?: string; updatedAt?: string }
}) {
  const url = `${SITE_URL}/blog/${post.slug}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
        dateModified: post.updatedAt || post.publishedAt || undefined,
        ...(post.coverImage ? { image: post.coverImage } : {}),
        author: {
          "@type": "Person",
          name: AUTHOR_NAME,
          url: `${SITE_URL}/`,
          image: AUTHOR_PHOTO,
        },
        publisher: {
          "@type": "Person",
          name: AUTHOR_NAME,
          url: `${SITE_URL}/`,
          logo: { "@type": "ImageObject", url: AUTHOR_PHOTO },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

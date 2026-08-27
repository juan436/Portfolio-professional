import Script from "next/script"

/**
 * Structured data de un post de blog, inyectado como `<script type="application/ld+json">`.
 * Recibe: `post` (title/excerpt/slug/coverImage/publishedAt/updatedAt).
 * Produce: un `@graph` con `BlogPosting` (headline, fechas, autor con imagen,
 * publisher, mainEntityOfPage) + `BreadcrumbList` (Inicio › Blog › Artículo)
 * para que Google muestre la ruta en el resultado de búsqueda.
 */
const SITE_URL = "https://jevy.dev"
const AUTHOR_NAME = "Juan Villegas"
const AUTHOR_IMAGE = "https://images.jvserver.com/images/profile/perfil-1751953703604-489800455.jpeg"

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
          image: AUTHOR_IMAGE,
        },
        publisher: {
          "@type": "Person",
          name: AUTHOR_NAME,
          url: `${SITE_URL}/`,
          logo: { "@type": "ImageObject", url: AUTHOR_IMAGE },
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

  return (
    <Script
      id="blog-posting-json-ld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

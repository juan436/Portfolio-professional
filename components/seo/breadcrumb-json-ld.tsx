import { SITE_URL } from "@/lib/site-config"

/**
 * `BreadcrumbList` JSON-LD reutilizable — declara la ruta jerárquica de una
 * página para que Google la muestre en el resultado de búsqueda.
 * Recibe: `items` (nombre + url; el último item puede ir sin url).
 * Produce: un `<script type="application/ld+json">` en el HTML servido.
 */

export function BreadcrumbJsonLd({ items }: { items: { name: string; path?: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

import { PERSON_ID } from "@/app/components/json-ld"
import { SITE_URL } from "@/lib/site-config"
import { getProjectTechnologies } from "@/lib/utils"

/**
 * JSON-LD para una ficha de trabajo (proyecto / automatización / agente — todas
 * viven en el modelo `Project`). Emite `CreativeWork` (o `SoftwareApplication`
 * para las que aplique), con el autor enganchado por `@id` a la Person del
 * `@graph` global.
 * Recibe: `item` (doc de Project plano), `kind` (para el tipo de schema y la URL).
 * Produce: un `<script type="application/ld+json">` en el HTML servido.
 */
const KIND_ROUTE: Record<string, string> = {
  project: "/projects",
  automation: "/automations",
  agent: "/agents",
  laboratory: "/laboratory",
}

export function WorkJsonLd({
  item,
  kind,
}: {
  item: { title: string; slug: string; description?: string; image?: string; techStack?: any; tags?: string[]; createdAt?: string }
  kind: "project" | "automation" | "agent" | "laboratory"
}) {
  const url = `${SITE_URL}${KIND_ROUTE[kind]}/${item.slug}`
  const keywords = getProjectTechnologies(item)

  const isSoftware = kind === "project" || kind === "agent"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isSoftware ? "SoftwareApplication" : "CreativeWork",
    name: item.title,
    ...(item.description ? { description: item.description } : {}),
    url,
    ...(item.image ? { image: item.image } : {}),
    ...(keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
    ...(item.createdAt ? { dateCreated: item.createdAt } : {}),
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    ...(isSoftware ? { applicationCategory: kind === "agent" ? "AI Agent" : "WebApplication" } : {}),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

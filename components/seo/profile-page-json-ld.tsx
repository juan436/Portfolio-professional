import { PERSON_ID } from "@/app/components/json-ld"
import { SITE_URL } from "@/lib/site-config"

/**
 * `ProfilePage` JSON-LD — declara que la home (`jevy.dev/`) es la página
 * oficial de perfil de Juan Villegas. Se monta SOLO en `app/page.tsx`.
 * Recibe: nada.
 * Produce: un `<script type="application/ld+json">` con `mainEntity` → la Person
 * del `@graph` global (por `@id`).
 */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profilepage`,
  url: `${SITE_URL}/`,
  name: "Juan Villegas — Arquitecto de Soluciones y Dev Full Stack",
  inLanguage: "es",
  mainEntity: { "@id": PERSON_ID },
}

export function ProfilePageJsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  )
}

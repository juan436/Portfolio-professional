/**
 * Structured data global (schema.org) — se inyecta en `app/layout.tsx`, sale
 * en el HTML servido (no vía `next/script`, que solo lo agrega tras hidratar).
 * Recibe: nada.
 * Produce: un `<script type="application/ld+json">` con un `@graph` de 3 entidades
 * enganchadas por `@id`: la persona (Juan Villegas), la marca (Jevy) y el sitio
 * (jevy.dev). Así Google entiende que apuntan a lo mismo.
 */
import { SITE_URL, SITE_NAME, AUTHOR_NAME, AUTHOR_PHOTO, SAME_AS } from "@/lib/site-config"

export const PERSON_ID = `${SITE_URL}/#juan`
export const ORG_ID = `${SITE_URL}/#jevy`
export const WEBSITE_ID = `${SITE_URL}/#website`

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: AUTHOR_NAME,
      url: `${SITE_URL}/`,
      image: AUTHOR_PHOTO,
      jobTitle: "Arquitecto de Soluciones y Desarrollador Full Stack",
      description:
        "Desarrollador Full Stack y Arquitecto de Soluciones. Construye sistemas completos —front, back e infraestructura— más automatizaciones y agentes de IA en producción.",
      knowsAbout: [
        "Desarrollo Web",
        "Next.js",
        "React",
        "Node.js",
        "NestJS",
        "Arquitectura Hexagonal",
        "PostgreSQL",
        "MongoDB",
        "Docker",
        "Infraestructura en producción",
        "Automatización de procesos",
        "Agentes de IA",
        "n8n",
      ],
      knowsLanguage: ["es", "en", "fr", "it"],
      sameAs: SAME_AS,
      alumniOf: {
        "@type": "EducationalOrganization",
        name: 'Universidad Centroccidental "Lisandro Alvarado"',
      },
      worksFor: { "@id": ORG_ID },
    },
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      alternateName: "jevy.dev",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-jevy.png`,
        width: 512,
        height: 285,
      },
      image: `${SITE_URL}/logo-jevy.png`,
      description:
        "Práctica de desarrollo de software de Juan Villegas: sistemas full stack a medida, infraestructura en producción, automatizaciones y agentes de IA.",
      founder: { "@id": PERSON_ID },
      knowsLanguage: ["es", "en", "fr", "it"],
      areaServed: ["Europa", "América Latina", "Remoto"],
      sameAs: SAME_AS,
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: "jevy.dev",
      inLanguage: "es",
      publisher: { "@id": ORG_ID },
      about: { "@id": PERSON_ID },
    },
  ],
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}

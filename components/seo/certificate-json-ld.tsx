import { PERSON_ID } from "@/app/components/json-ld"
import { SITE_URL } from "@/lib/site-config"

/**
 * `EducationalOccupationalCredential` JSON-LD para una certificación real.
 * Recibe: `certificate` (issuer/date/credentialUrl/title/slug).
 * Produce: un `<script type="application/ld+json">` en el HTML servido.
 */

export function CertificateJsonLd({
  certificate,
}: {
  certificate: { title: string; slug: string; issuer?: string; date?: string; credentialUrl?: string; learned?: string }
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    name: certificate.title,
    url: `${SITE_URL}/certificates/${certificate.slug}`,
    credentialCategory: "certificate",
    ...(certificate.learned ? { description: certificate.learned } : {}),
    ...(certificate.date ? { dateCreated: certificate.date } : {}),
    ...(certificate.issuer
      ? { recognizedBy: { "@type": "Organization", name: certificate.issuer } }
      : {}),
    ...(certificate.credentialUrl ? { sameAs: certificate.credentialUrl } : {}),
    about: { "@id": PERSON_ID },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

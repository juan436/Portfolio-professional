import type { Metadata } from "next"
import { getCertificateBySlug } from "@/lib/data/certificates"
import { CertificateDetailView } from "@/components/certificates/certificate-detail-view"
import { CertificateJsonLd } from "@/components/seo/certificate-json-ld"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const certificate = await getCertificateBySlug(slug)
  if (!certificate) return NOT_FOUND_METADATA

  return buildMetadata({
    title: certificate.title,
    description: certificate.learned || `Certificación de ${certificate.issuer}.`,
    path: `/certificates/${slug}`,
    image: certificate.image,
    locale,
  })
}

/** Página `/certificates/[slug]` (Server Component). Recibe: `params.slug`. Produce: detalle de la certificación. */
export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const certificate = await getCertificateBySlug(slug)

  return (
    <>
      {certificate && (
        <>
          <CertificateJsonLd certificate={certificate} />
          <BreadcrumbJsonLd
            items={[
              { name: "Inicio", path: "/" },
              { name: "Certificaciones", path: "/certificates" },
              { name: certificate.title },
            ]}
          />
        </>
      )}
      <CertificateDetailView certificate={certificate} />
    </>
  )
}

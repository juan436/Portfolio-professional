import type { Metadata } from "next"
import { getCertificateBySlug } from "@/lib/data/certificates"
import { CertificateDetailView } from "@/components/certificates/certificate-detail-view"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const certificate = await getCertificateBySlug(slug)
  if (!certificate) return NOT_FOUND_METADATA

  return buildMetadata({
    title: certificate.title,
    description: certificate.learned || `Certificación de ${certificate.issuer}.`,
    path: `/certificates/${slug}`,
    image: certificate.image,
  })
}

/** Página `/certificates/[slug]` (Server Component). Recibe: `params.slug`. Produce: detalle de la certificación. */
export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const certificate = await getCertificateBySlug(slug)

  return <CertificateDetailView certificate={certificate} />
}

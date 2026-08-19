import { getCertificateBySlug } from "@/lib/data/certificates"
import { CertificateDetailView } from "@/components/certificates/certificate-detail-view"

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const certificate = await getCertificateBySlug(slug)

  return <CertificateDetailView certificate={certificate} />
}

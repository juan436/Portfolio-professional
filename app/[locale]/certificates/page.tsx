import type { Metadata } from "next"
import { getCertificatesList } from "@/lib/data/certificates"
import { CertificatesListView } from "@/components/certificates/certificates-list-view"
import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
  title: "Certificaciones",
  description:
    "Certificaciones reales y verificables de Juan Villegas: la base técnica detrás de cada proyecto y automatización de este portafolio.",
  path: "/certificates",
    locale,
  })
}

/** Página `/certificates` (Server Component). Recibe: nada. Produce: lista completa de certificaciones. */
export default async function CertificatesPage() {
  const certificates = await getCertificatesList()
  return <CertificatesListView certificates={certificates} />
}

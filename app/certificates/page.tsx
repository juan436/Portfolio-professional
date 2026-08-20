import { getCertificatesList } from "@/lib/data/certificates"
import { CertificatesListView } from "@/components/certificates/certificates-list-view"

/** Página `/certificates` (Server Component). Recibe: nada. Produce: lista completa de certificaciones. */
export default async function CertificatesPage() {
  const certificates = await getCertificatesList()
  return <CertificatesListView certificates={certificates} />
}

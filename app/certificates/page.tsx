import { getCertificatesList } from "@/lib/data/certificates"
import { CertificatesListView } from "@/components/certificates/certificates-list-view"

export default async function CertificatesPage() {
  const certificates = await getCertificatesList()
  return <CertificatesListView certificates={certificates} />
}

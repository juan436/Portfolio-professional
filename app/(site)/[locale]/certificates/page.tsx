import type { Metadata } from "next"
import { getServerT } from "@/lib/i18n/server-dict"
import { getCertificatesList } from "@/lib/data/certificates"
import { CertificatesListView } from "@/components/certificates/certificates-list-view"
import { buildMetadata } from "@/lib/seo/metadata"
import { siteOgImage } from "@/lib/site-config"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = getServerT(locale)
  return buildMetadata({
    title: t("seo.certificates.title"),
    description: t("seo.certificates.description"),
    path: "/certificates",
    locale,
    image: siteOgImage(locale),
  })
}

export default async function CertificatesPage() {
  const certificates = await getCertificatesList()
  return <CertificatesListView certificates={certificates} />
}

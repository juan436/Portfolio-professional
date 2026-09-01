import type { Metadata } from "next"
import { pickLocalized } from "@/lib/i18n/pick-localized"
import { getServerT } from "@/lib/i18n/server-dict"
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
    title: pickLocalized(certificate, locale, "title"),
    description:
      pickLocalized(certificate, locale, "learned") ||
      `Certificación de ${pickLocalized(certificate, locale, "issuer")}.`,
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
  const st = getServerT(locale)
  const locTitle = certificate ? pickLocalized(certificate, locale, "title") : ""

  return (
    <>
      {certificate && (
        <>
          <CertificateJsonLd
            locale={locale}
            certificate={{
              ...certificate,
              title: locTitle,
              issuer: pickLocalized(certificate, locale, "issuer"),
              learned: pickLocalized(certificate, locale, "learned"),
            }}
          />
          <BreadcrumbJsonLd
            items={[
              { name: st("nav.home"), path: `/${locale}` },
              { name: st("seo.certificates.title"), path: `/${locale}/certificates` },
              { name: locTitle },
            ]}
          />
        </>
      )}
      <CertificateDetailView certificate={certificate} />
    </>
  )
}

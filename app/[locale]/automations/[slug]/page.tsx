import type { Metadata } from "next"
import { pickLocalized } from "@/lib/i18n/pick-localized"
import { getServerT } from "@/lib/i18n/server-dict"
import { getProjectDetail } from "@/lib/data/project-detail"
import { AutomationDetailView } from "@/components/automations/automation-detail-view"
import { WorkJsonLd } from "@/components/seo/work-json-ld"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const data = await getProjectDetail(slug)
  if (!data?.project) return NOT_FOUND_METADATA

  return buildMetadata({
    title: pickLocalized(data.project, locale, "title"),
    description: pickLocalized(data.project, locale, "description"),
    path: `/automations/${slug}`,
    image: data.project.image,
    locale,
  })
}

export default async function AutomationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug, locale } = await params
  const st = getServerT(locale)
  const sp = await searchParams
  const cameFromWork = sp.from === "work"
  const data = await getProjectDetail(slug)

  return (
    <>
      {data?.project && (
        <>
          <WorkJsonLd item={{ ...data.project, title: pickLocalized(data.project, locale, "title"), description: pickLocalized(data.project, locale, "description") }} kind="automation" locale={locale} />
          <BreadcrumbJsonLd
            items={[
              { name: st("nav.home"), path: `/${locale}` },
              { name: st("nav.automations"), path: `/${locale}/automations` },
              { name: pickLocalized(data.project, locale, "title") },
            ]}
          />
        </>
      )}
      <AutomationDetailView
        automation={data?.project ?? null}
        testimonials={data?.testimonials ?? []}
        resultsMetrics={data?.metrics ?? []}
        cameFromWork={cameFromWork}
      />
    </>
  )
}

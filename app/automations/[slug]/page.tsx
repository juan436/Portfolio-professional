import type { Metadata } from "next"
import { getProjectDetail } from "@/lib/data/project-detail"
import { AutomationDetailView } from "@/components/automations/automation-detail-view"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getProjectDetail(slug)
  if (!data?.project) return NOT_FOUND_METADATA

  return buildMetadata({
    title: data.project.title,
    description: data.project.description,
    path: `/automations/${slug}`,
    image: data.project.image,
  })
}

/** Página `/automations/[slug]` (Server Component). Recibe: `params.slug` + `?from=work`. Produce: detalle de la automatización + testimonios + métricas. */
export default async function AutomationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const cameFromWork = sp.from === "work"
  const data = await getProjectDetail(slug)

  return (
    <AutomationDetailView
      automation={data?.project ?? null}
      testimonials={data?.testimonials ?? []}
      resultsMetrics={data?.metrics ?? []}
      cameFromWork={cameFromWork}
    />
  )
}

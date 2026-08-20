import { getProjectDetail } from "@/lib/data/project-detail"
import { AutomationDetailView } from "@/components/automations/automation-detail-view"

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

import { getProjectDetail } from "@/lib/data/project-detail"
import { ProjectDetailView } from "@/components/projects/project-detail-view"

/** Página `/projects/[slug]` (Server Component). Recibe: `params.slug`. Produce: detalle del proyecto + testimonios + métricas. */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getProjectDetail(slug)

  return (
    <ProjectDetailView
      project={data?.project ?? null}
      testimonials={data?.testimonials ?? []}
      resultsMetrics={data?.metrics ?? []}
    />
  )
}

import { getProjectDetail } from "@/lib/data/project-detail"
import { ProjectDetailView } from "@/components/projects/project-detail-view"

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

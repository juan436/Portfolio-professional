import { getProjectBySlug } from "@/lib/data/projects"
import { LaboratoryDetailView } from "@/components/laboratory/laboratory-detail-view"

/** Página `/laboratory/[slug]` (Server Component). Recibe: `params.slug`. Produce: detalle del proyecto de Laboratorio. */
export default async function LaboratoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  return <LaboratoryDetailView project={project} />
}

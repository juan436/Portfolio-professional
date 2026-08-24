import type { Metadata } from "next"
import { getProjectBySlug } from "@/lib/data/projects"
import { LaboratoryDetailView } from "@/components/laboratory/laboratory-detail-view"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return NOT_FOUND_METADATA

  return buildMetadata({
    title: project.title,
    description: project.description,
    path: `/laboratory/${slug}`,
    image: project.image,
  })
}

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

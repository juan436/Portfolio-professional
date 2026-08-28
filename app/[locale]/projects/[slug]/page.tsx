import type { Metadata } from "next"
import { getProjectDetail } from "@/lib/data/project-detail"
import { ProjectDetailView } from "@/components/projects/project-detail-view"
import { WorkJsonLd } from "@/components/seo/work-json-ld"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
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
    path: `/projects/${slug}`,
    image: data.project.image,
  })
}

/** Página `/projects/[slug]` (Server Component). Recibe: `params.slug`. Produce: detalle del proyecto + testimonios + métricas. */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getProjectDetail(slug)

  return (
    <>
      {data?.project && (
        <>
          <WorkJsonLd item={data.project} kind="project" />
          <BreadcrumbJsonLd
            items={[
              { name: "Inicio", path: "/" },
              { name: "Trabajo", path: "/work" },
              { name: data.project.title },
            ]}
          />
        </>
      )}
      <ProjectDetailView
        project={data?.project ?? null}
        testimonials={data?.testimonials ?? []}
        resultsMetrics={data?.metrics ?? []}
      />
    </>
  )
}

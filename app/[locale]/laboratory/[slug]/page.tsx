import type { Metadata } from "next"
import { pickLocalized } from "@/lib/i18n/pick-localized"
import { getProjectBySlug } from "@/lib/data/projects"
import { LaboratoryDetailView } from "@/components/laboratory/laboratory-detail-view"
import { WorkJsonLd } from "@/components/seo/work-json-ld"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return NOT_FOUND_METADATA

  return buildMetadata({
    title: pickLocalized(project, locale, "title"),
    description: pickLocalized(project, locale, "description"),
    path: `/laboratory/${slug}`,
    image: project.image,
    locale,
  })
}

/** Página `/laboratory/[slug]` (Server Component). Recibe: `params.slug`. Produce: detalle del proyecto de Laboratorio. */
export default async function LaboratoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const project = await getProjectBySlug(slug)

  return (
    <>
      {project && (
        <>
          <WorkJsonLd item={project} kind="laboratory" />
          <BreadcrumbJsonLd
            items={[
              { name: "Inicio", path: "/" },
              { name: "Laboratorio", path: "/laboratory" },
              { name: project.title },
            ]}
          />
        </>
      )}
      <LaboratoryDetailView project={project} />
    </>
  )
}

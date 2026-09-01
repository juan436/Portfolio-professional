import type { Metadata } from "next"
import { getServerT } from "@/lib/i18n/server-dict"
import { getProjectsByCategory } from "@/lib/data/projects"
import { LaboratoryListView } from "@/components/laboratory/laboratory-list-view"
import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = getServerT(locale)
  return buildMetadata({
    title: t("seo.laboratory.title"),
    description: t("seo.laboratory.description"),
    path: "/laboratory",
    locale,
  })
}

/** Página `/laboratory` (Server Component). Recibe: nada. Produce: lista de proyectos categoría "laboratorio". */
export default async function LaboratoryPage() {
  const labProjects = await getProjectsByCategory("laboratorio")
  return <LaboratoryListView labProjects={labProjects} />
}

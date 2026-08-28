import type { Metadata } from "next"
import { getProjectsByCategory } from "@/lib/data/projects"
import { LaboratoryListView } from "@/components/laboratory/laboratory-list-view"
import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
  title: "Laboratorio R&D",
  description:
    "Experimentos técnicos reales de Juan Villegas: hipótesis, método probado y qué funcionó o no, antes de que una idea llegue a producción.",
  path: "/laboratory",
    locale,
  })
}

/** Página `/laboratory` (Server Component). Recibe: nada. Produce: lista de proyectos categoría "laboratorio". */
export default async function LaboratoryPage() {
  const labProjects = await getProjectsByCategory("laboratorio")
  return <LaboratoryListView labProjects={labProjects} />
}

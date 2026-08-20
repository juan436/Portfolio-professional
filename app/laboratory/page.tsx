import { getProjectsByCategory } from "@/lib/data/projects"
import { LaboratoryListView } from "@/components/laboratory/laboratory-list-view"

/** Página `/laboratory` (Server Component). Recibe: nada. Produce: lista de proyectos categoría "laboratorio". */
export default async function LaboratoryPage() {
  const labProjects = await getProjectsByCategory("laboratorio")
  return <LaboratoryListView labProjects={labProjects} />
}

import { getProjectsByCategory } from "@/lib/data/projects"
import { LaboratoryListView } from "@/components/laboratory/laboratory-list-view"

export default async function LaboratoryPage() {
  const labProjects = await getProjectsByCategory("laboratorio")
  return <LaboratoryListView labProjects={labProjects} />
}

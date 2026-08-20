import { getProjectsByCategory } from "@/lib/data/projects"
import { AutomationsListView } from "@/components/automations/automations-list-view"

/** Página `/automations` (Server Component). Recibe: nada. Produce: lista de proyectos categoría "automatizacion". */
export default async function AutomationsPage() {
  const automations = await getProjectsByCategory("automatizacion")
  return <AutomationsListView automations={automations} />
}

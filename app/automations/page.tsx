import { getProjectsByCategory } from "@/lib/data/projects"
import { AutomationsListView } from "@/components/automations/automations-list-view"

export default async function AutomationsPage() {
  const automations = await getProjectsByCategory("automatizacion")
  return <AutomationsListView automations={automations} />
}

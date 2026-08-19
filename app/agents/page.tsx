import { getProjectsByCategory } from "@/lib/data/projects"
import { AgentsListView } from "@/components/agents/agents-list-view"

export default async function AgentsPage() {
  const agents = await getProjectsByCategory("agente")
  return <AgentsListView agents={agents} />
}

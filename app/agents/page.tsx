import { getProjectsByCategory } from "@/lib/data/projects"
import { AgentsListView } from "@/components/agents/agents-list-view"

/** Página `/agents` (Server Component). Recibe: nada. Produce: lista de proyectos categoría "agente". */
export default async function AgentsPage() {
  const agents = await getProjectsByCategory("agente")
  return <AgentsListView agents={agents} />
}

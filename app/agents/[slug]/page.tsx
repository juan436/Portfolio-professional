import { getProjectBySlug } from "@/lib/data/projects"
import { AgentDetailView } from "@/components/agents/agent-detail-view"

export default async function AgentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const cameFromWork = sp.from === "work"
  const agent = await getProjectBySlug(slug)

  return <AgentDetailView agent={agent} cameFromWork={cameFromWork} />
}

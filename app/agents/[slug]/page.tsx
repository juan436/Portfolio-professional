import type { Metadata } from "next"
import { getProjectBySlug } from "@/lib/data/projects"
import { AgentDetailView } from "@/components/agents/agent-detail-view"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const agent = await getProjectBySlug(slug)
  if (!agent) return NOT_FOUND_METADATA

  return buildMetadata({
    title: agent.title,
    description: agent.description,
    path: `/agents/${slug}`,
    image: agent.image,
  })
}

/** Página `/agents/[slug]` (Server Component). Recibe: `params.slug` + `?from=work`. Produce: detalle del agente. */
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

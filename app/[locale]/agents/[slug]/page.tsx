import type { Metadata } from "next"
import { pickLocalized } from "@/lib/i18n/pick-localized"
import { getServerT } from "@/lib/i18n/server-dict"
import { getProjectBySlug } from "@/lib/data/projects"
import { AgentDetailView } from "@/components/agents/agent-detail-view"
import { WorkJsonLd } from "@/components/seo/work-json-ld"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld"
import { buildMetadata, NOT_FOUND_METADATA } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const agent = await getProjectBySlug(slug)
  if (!agent) return NOT_FOUND_METADATA

  return buildMetadata({
    title: pickLocalized(agent, locale, "title"),
    description: pickLocalized(agent, locale, "description"),
    path: `/agents/${slug}`,
    image: agent.image,
    locale,
  })
}

/** Página `/agents/[slug]` (Server Component). Recibe: `params.slug` + `?from=work`. Produce: detalle del agente. */
export default async function AgentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug, locale } = await params
  const st = getServerT(locale)
  const sp = await searchParams
  const cameFromWork = sp.from === "work"
  const agent = await getProjectBySlug(slug)

  return (
    <>
      {agent && (
        <>
          <WorkJsonLd item={{ ...agent, title: pickLocalized(agent, locale, "title"), description: pickLocalized(agent, locale, "description") }} kind="agent" locale={locale} />
          <BreadcrumbJsonLd
            items={[
              { name: st("nav.home"), path: `/${locale}` },
              { name: st("nav.agents"), path: `/${locale}/work#agents` },
              { name: pickLocalized(agent, locale, "title") },
            ]}
          />
        </>
      )}
      <AgentDetailView agent={agent} cameFromWork={cameFromWork} />
    </>
  )
}

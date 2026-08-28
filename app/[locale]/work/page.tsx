import type { Metadata } from "next"
import { getServerT } from "@/lib/i18n/server-dict"
import { getProjectsByCategory } from "@/lib/data/projects"
import WorkIntro from "@/components/work"
import Projects from "@/components/projects"
import Automations from "@/components/automations"
import Agents from "@/components/agents"
import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = getServerT(locale)
  return buildMetadata({
    title: t("seo.work.title"),
    description: t("seo.work.description"),
    path: "/work",
    locale,
  })
}

/**
 * Página `/work` (Server Component) — resumen de las 3 categorías con lista fija (web/mobile/infra_backend leídas por `Projects`).
 * Recibe: nada.
 * Procesa: trae automatizaciones y agentes en paralelo.
 * Produce: `WorkIntro` + `Projects` + `Automations` + `Agents`.
 */
export default async function WorkPage() {
  const [automations, agents] = await Promise.all([
    getProjectsByCategory("automatizacion"),
    getProjectsByCategory("agente"),
  ])

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="pt-28 flex-grow">
        <WorkIntro />
        <Projects />
        <Automations automations={automations} />
        <Agents agents={agents} />
      </div>
    </main>
  )
}

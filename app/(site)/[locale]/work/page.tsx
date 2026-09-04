import type { Metadata } from "next"
import { getServerT } from "@/lib/i18n/server-dict"
import { getHomeContent } from "@/lib/data/home-content"
import { getProjectsByCategory } from "@/lib/data/projects"
import WorkIntro from "@/components/work"
import Projects from "@/components/projects"
import Automations from "@/components/automations"
import Agents from "@/components/agents"
import { buildMetadata } from "@/lib/seo/metadata"
import { siteOgImage } from "@/lib/site-config"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = getServerT(locale)
  return buildMetadata({
    title: t("seo.work.title"),
    description: t("seo.work.description"),
    path: "/work",
    locale,
    image: siteOgImage(locale),
  })
}

/**
 * Página `/work` (Server Component). Trae las 5 listas server-side y las pasa por
 * prop — proyectos (web/mobile/infra vía `getHomeContent`), automatizaciones y
 * agentes. Así los 3 grids salen ya renderizados en el HTML (sin el pop-in que
 * tenía `<Projects>` cuando leía del ContentProvider).
 * Produce: `WorkIntro` + `Projects` + `Automations` + `Agents`.
 */
export default async function WorkPage() {
  const [{ projects }, automations, agents] = await Promise.all([
    getHomeContent(),
    getProjectsByCategory("automatizacion"),
    getProjectsByCategory("agente"),
  ])

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="pt-28 flex-grow">
        <WorkIntro />
        <Projects projects={projects} />
        <Automations automations={automations} />
        <Agents agents={agents} />
      </div>
    </main>
  )
}

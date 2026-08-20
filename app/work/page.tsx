import { getProjectsByCategory } from "@/lib/data/projects"
import WorkIntro from "@/components/work"
import Projects from "@/components/projects"
import Automations from "@/components/automations"
import Agents from "@/components/agents"

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

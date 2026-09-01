import type { Metadata } from "next"
import { getProjectsByCategory } from "@/lib/data/projects"
import { AutomationsListView } from "@/components/automations/automations-list-view"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "Automatizaciones",
  description:
    "Automatizaciones y flujos de IA de Juan Villegas ya en producción: procesos que corren solos, integraciones entre sistemas y agentes que conversan con clientes reales.",
  path: "/automations",
})

export default async function AutomationsPage() {
  const automations = await getProjectsByCategory("automatizacion")
  return <AutomationsListView automations={automations} />
}

import { Bot } from "lucide-react"

// Mapa string->ícono, mismo patrón que flowIconMap (components/automations/flow-card.tsx).
// Un solo valor real por ahora — default a Bot para cualquier ícono no mapeado.
export const agentIconMap: Record<string, typeof Bot> = {
  jevy: Bot,
}

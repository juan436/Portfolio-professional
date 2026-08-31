import { Bot } from "lucide-react"

/**
 * Mapa string→ícono para agentes, mismo patrón que flowIconMap (components/automations/flow-card.tsx).
 * Recibe: nada (objeto estático).
 * Produce: `agentIconMap[key]`; el caller cae a `Bot` si la key no está mapeada.
 */
export const agentIconMap: Record<string, typeof Bot> = {
  jevy: Bot,
}

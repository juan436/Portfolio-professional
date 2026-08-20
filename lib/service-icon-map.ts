import {
  Code,
  Server,
  Database,
  Cpu,
  Globe,
  Smartphone,
  Monitor,
  Cloud,
  Shield,
  LineChart,
  Settings,
  Layers,
  Briefcase,
  PenTool,
  FileCode,
  Zap,
  type LucideIcon,
} from "lucide-react"

/**
 * Mapa nombre→ícono Lucide para la sección Servicios del Admin/sitio.
 * Recibe: `getServiceIconComponent(name)`.
 * Produce: `LucideIcon` (cae a `Code` si `name` no está mapeado).
 */
// Mismo patrón que flowIconMap (components/automations/flow-card.tsx) y
// agentIconMap (components/agents/agent-icon-map.ts). Reemplaza el switch de
// 16 casos que estaba copiado en service-icon-selector.tsx, services-form.tsx
// y components/services/index.tsx (auditoría 2026-08-18 §6.6, cerrado del
// todo 2026-08-20). "Code" es el default para cualquier valor no mapeado,
// igual que en los switches originales.
//
// components/services/index.tsx (sitio público) sigue usando Code2 en vez de
// Code para ese default — discrepancia visual ya existente en producción, se
// resuelve ahí mismo con un override local, no acá, para no alterar el ícono
// que ya se ve sin confirmar si Code vs Code2 fue intencional.
export const serviceIconMap: Record<string, LucideIcon> = {
  Code,
  Server,
  Database,
  Cpu,
  Globe,
  Smartphone,
  Monitor,
  Cloud,
  Shield,
  LineChart,
  Settings,
  Layers,
  Briefcase,
  PenTool,
  FileCode,
  Zap,
}

export function getServiceIconComponent(name: string): LucideIcon {
  return serviceIconMap[name] || Code
}

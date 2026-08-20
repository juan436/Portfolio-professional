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
// 16 casos que estaba copiado en service-icon-selector.tsx y services-form.tsx
// (auditoría 2026-08-18 §6.6). "Code" es el default para cualquier valor no
// mapeado, igual que en los 2 switches originales.
//
// components/services/index.tsx (sitio público) usa Code2 para "Code", no
// Code — discrepancia real ya existente antes de este cambio, no unificada
// acá para no alterar el ícono que ya se ve en producción sin confirmar si
// fue intencional.
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

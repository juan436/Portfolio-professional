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

import type { LucideIcon } from "lucide-react"
import { Layers } from "lucide-react"

/**
 * Tarjetas del sidebar de las vistas de detalle (`project` / `laboratory`).
 * Extraídas de `project-detail-view` y `laboratory-detail-view` en la auditoría
 * 2026-08-27 §3 — el markup estaba calcado (stack técnico ×2, lista con bullets ×6).
 *
 * `headingBold` refleja una diferencia real preexistente entre los dos archivos
 * (laboratory usa `font-bold` en estos `<h2>`, project no) — se preserva tal cual.
 */

const CARD = "p-5 rounded-xl bg-zinc-900/40 border border-white/5"

function CardHeading({ icon: Icon, bold, children }: { icon: LucideIcon; bold?: boolean; children: string }) {
  return (
    <h2 className={`text-sm ${bold ? "font-bold " : ""}mb-4 flex items-center gap-2 text-white`}>
      <Icon className="h-4 w-4 text-blue-500" />
      {children}
    </h2>
  )
}

interface TechStackCardProps {
  entries: [string, string[]][]
  categoryLabels: Record<string, string>
  heading: string
  headingBold?: boolean
}

export function TechStackCard({ entries, categoryLabels, heading, headingBold }: TechStackCardProps) {
  if (entries.length === 0) return null
  return (
    <div className={CARD}>
      <CardHeading icon={Layers} bold={headingBold}>
        {heading}
      </CardHeading>
      <div className="space-y-4">
        {entries.map(([category, items]) => (
          <div key={category}>
            <p className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-2">
              {categoryLabels[category] || category}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item}
                  className="bg-white/5 border border-white/10 text-slate-300 text-xs px-2 py-1 rounded"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SidebarListCardProps {
  icon: LucideIcon
  heading: string
  items: string[]
  /** Icono por ítem. Si se omite, se usa el punto azul (`•`). */
  itemIcon?: LucideIcon
  headingBold?: boolean
}

export function SidebarListCard({ icon, heading, items, itemIcon: ItemIcon, headingBold }: SidebarListCardProps) {
  if (items.length === 0) return null
  return (
    <div className={CARD}>
      <CardHeading icon={icon} bold={headingBold}>
        {heading}
      </CardHeading>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            {ItemIcon ? (
              <ItemIcon className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            ) : (
              <span className="mt-2 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

"use client"

import { LocalizedLink as Link } from "@/components/common/localized-link"
import { motion } from "framer-motion"
import { MessageCircle, ShoppingCart, Share2, Receipt, CalendarClock } from "lucide-react"

export const flowIconMap: Record<string, typeof MessageCircle> = {
  "customer-service": MessageCircle,
  "sales": ShoppingCart,
  "social": Share2,
  "invoice": Receipt,
  "calendar": CalendarClock,
}

/**
 * Card de automatización (grid de /automations).
 * Recibe: `flow: FlowCardData` (id/slug/icon/title/description/stepsCount/subtype) + `stepsWord`/`index`.
 * Produce: link a `/automations/{slug}`.
 */
export interface FlowCardData {
  id: string
  slug: string
  icon: string
  title: string
  description: string
  stepsCount: number
  subtype?: string
}

interface FlowCardProps {
  flow: FlowCardData
  stepsWord: string
  index: number
}

export function FlowCard({ flow, stepsWord, index }: FlowCardProps) {
  const { slug, icon, title, description, stepsCount, subtype } = flow
  const Icon = flowIconMap[icon] || MessageCircle

  return (
    <Link href={`/automations/${slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="relative bg-zinc-900/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-blue-500/50 transition-all cursor-pointer group h-full"
      >
        {subtype && (
          <div className="absolute top-4 right-4 bg-blue-600/20 text-blue-400 text-[10px] font-mono px-2 py-1 rounded-full border border-blue-600/30 uppercase font-bold">
            {subtype}
          </div>
        )}

        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 w-fit group-hover:bg-blue-500/20 transition-colors">
          <Icon className="h-8 w-8 text-blue-500" />
        </div>

        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-400 mb-4">{description}</p>
        <span className="text-xs text-blue-400 font-medium">
          {stepsCount} {stepsWord} →
        </span>
      </motion.div>
    </Link>
  )
}

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Bot } from "lucide-react"
import { agentIconMap } from "./agent-icon-map"

interface AgentCardProps {
  id: string
  icon: string
  title: string
  description: string
  capabilitiesCount: number
  capabilitiesWord: string
  subtype?: string
  index: number
}

export function AgentCard({
  id,
  icon,
  title,
  description,
  capabilitiesCount,
  capabilitiesWord,
  subtype,
  index,
}: AgentCardProps) {
  const Icon = agentIconMap[icon] || Bot

  return (
    <Link href={`/agents/${id}`}>
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
          {capabilitiesCount} {capabilitiesWord} →
        </span>
      </motion.div>
    </Link>
  )
}

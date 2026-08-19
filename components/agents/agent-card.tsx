"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { RobotAvatar } from "./robot-avatar"

interface AgentCardProps {
  id: string
  slug: string
  title: string
  description: string
  capabilities: string[]
  subtype?: string
  index: number
}

export function AgentCard({ slug, title, description, capabilities, subtype, index }: AgentCardProps) {
  const [hovered, setHovered] = useState(false)
  const visibleCapabilities = capabilities.slice(0, 3)
  const extraCount = capabilities.length - visibleCapabilities.length

  return (
    <Link href={`/agents/${slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="relative bg-zinc-900/40 border border-white/10 rounded-xl p-6 pt-8 backdrop-blur-sm hover:border-blue-500/50 transition-all cursor-pointer group h-full flex flex-col items-center text-center overflow-visible"
      >
        {subtype && (
          <div className="absolute top-4 right-4 bg-blue-600/20 text-blue-400 text-[10px] font-mono px-2 py-1 rounded-full border border-blue-600/30 uppercase font-bold">
            {subtype}
          </div>
        )}

        <div
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <RobotAvatar />

          <AnimatePresence>
            {hovered && description && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 z-20 pointer-events-none"
              >
                <div className="relative bg-zinc-950/95 border border-blue-500/40 rounded-lg px-4 py-3 shadow-[0_0_20px_rgba(37,99,235,0.25)]">
                  <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950/95 border-r border-b border-blue-500/40 rotate-45" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-4 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        {visibleCapabilities.length > 0 && (
          <ul className="text-left space-y-1.5 w-full mt-auto pt-4 border-t border-white/5">
            {visibleCapabilities.map((cap, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                <Check className="text-blue-500 h-3 w-3 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1">{cap}</span>
              </li>
            ))}
            {extraCount > 0 && <li className="text-xs text-blue-400/70 pl-5">+{extraCount} más</li>}
          </ul>
        )}
      </motion.div>
    </Link>
  )
}

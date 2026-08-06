"use client"

import { motion } from "framer-motion"

interface LabIntroProps {
  title: string
  subtitle: string
  legendHeading: string
  statusLabels: Record<string, string>
}

const STATUS_ORDER = ["testing", "completed", "discontinued", "evolved"] as const

const STATUS_DOT: Record<string, string> = {
  testing: "bg-blue-400",
  completed: "bg-emerald-400",
  discontinued: "bg-slate-400",
  evolved: "bg-purple-400",
}

export function LabIntro({ title, subtitle, legendHeading, statusLabels }: LabIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8 relative z-10"
    >
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-balance text-blue-500">{title}</h1>
      <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-4">{subtitle}</p>

      <div className="inline-flex flex-col items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{legendHeading}</span>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {STATUS_ORDER.map((status) => (
            <span
              key={status}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/40 px-3 py-1.5 text-xs text-slate-400"
            >
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
              {statusLabels[status]}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

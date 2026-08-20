"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface WorkBlock {
  kind: "paragraph" | "steps"
  text?: string
  items?: string[]
}

export interface LabExpedienteProject {
  _id: string
  slug: string
  title: string
  tags?: string[]
  translations?: {
    en?: { title?: string }
    fr?: { title?: string }
    it?: { title?: string }
  }
  labDetails?: {
    status?: "testing" | "completed" | "discontinued" | "evolved"
    motivation?: string
    testing?: WorkBlock[]
    learnings?: WorkBlock[]
    nextStep?: string
  }
}

interface LabExpedienteCardProps {
  project: LabExpedienteProject
  fileNumber: number
  languageCode: string
  statusLabels: Record<string, string>
  fieldLabels: {
    hipotesis: string
    metodo: string
    hallazgo: string
    siguiente: string
    fileLabel: string
    stampRingLabel: string
    viewFullLabel: string
    naLabel: string
  }
}

const STATUS_ACCENT: Record<string, string> = {
  testing: "text-blue-400",
  completed: "text-emerald-400",
  discontinued: "text-slate-400",
  evolved: "text-purple-400",
}

function firstParagraph(blocks?: WorkBlock[]): string | undefined {
  return blocks?.find((b) => b.kind === "paragraph" && b.text)?.text
}

export function LabExpedienteCard({
  project,
  fileNumber,
  languageCode,
  statusLabels,
  fieldLabels,
}: LabExpedienteCardProps) {
  const { fileLabel, stampRingLabel, viewFullLabel, naLabel } = fieldLabels
  const details = project.labDetails
  const status = details?.status || "testing"
  const accentClass = STATUS_ACCENT[status] || STATUS_ACCENT.testing
  const statusText = statusLabels[status] || status
  const title =
    languageCode === "es" ? project.title : project.translations?.[languageCode as "en" | "fr" | "it"]?.title || project.title

  const hipotesis = details?.motivation
  const metodo = firstParagraph(details?.testing)
  const hallazgo = firstParagraph(details?.learnings)
  const siguiente = details?.nextStep

  const ringPathId = `ring-${project._id}`
  const statusWords = statusText.split(" ")
  const statusLine1 = statusWords[0] || ""
  const statusLine2 = statusWords.slice(1).join(" ")

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (fileNumber % 6) * 0.08 }}
      className={`relative h-full flex flex-col rounded bg-zinc-900/40 border border-white/10 backdrop-blur-md hover:border-blue-500/50 transition-all duration-300 pl-9 pr-8 pt-9 pb-7 ${accentClass}`}
    >
      <div
        className="absolute left-3 top-0 bottom-0 w-px opacity-60"
        style={{
          backgroundImage: `repeating-linear-gradient(currentColor 0 6px, transparent 6px 16px)`,
          color: "rgba(255,255,255,0.15)",
        }}
      />

      <svg viewBox="0 0 100 100" className={`absolute -top-3 right-4 w-20 h-20 rotate-[9deg] opacity-90 ${accentClass}`}>
        <defs>
          <path id={ringPathId} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.75" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <text fill="currentColor" fontFamily="ui-monospace, monospace" fontSize="6.6" letterSpacing="2.2" style={{ textTransform: "uppercase" }}>
          <textPath href={`#${ringPathId}`} startOffset="2%">
            {stampRingLabel}
          </textPath>
        </text>
        <text fill="currentColor" fontFamily="ui-monospace, monospace" fontWeight="700" fontSize="10" textAnchor="middle" x="50" y="47">
          {statusLine1}
        </text>
        <text fill="currentColor" fontFamily="ui-monospace, monospace" fontWeight="700" fontSize="10" textAnchor="middle" x="50" y="59">
          {statusLine2}
        </text>
      </svg>

      <p className="font-mono text-[11px] text-slate-500 tracking-wide mb-1">
        {fileLabel} {String(fileNumber).padStart(3, "0")}
      </p>
      <h2 className="h-14 text-xl font-bold text-white mb-5 max-w-[80%] leading-snug line-clamp-2">{title}</h2>

      <dl>
        <div className="py-3 border-t border-white/10">
          <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">
            {fieldLabels.hipotesis}
          </dt>
          <dd className={`h-24 text-sm leading-relaxed line-clamp-4 ${hipotesis ? "text-slate-400" : "text-slate-600 italic"}`}>
            {hipotesis || naLabel}
          </dd>
        </div>
        <div className="py-3 border-t border-white/10">
          <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">
            {fieldLabels.metodo}
          </dt>
          <dd className={`h-24 text-sm leading-relaxed line-clamp-4 ${metodo ? "text-slate-400" : "text-slate-600 italic"}`}>
            {metodo || naLabel}
          </dd>
        </div>
        <div className="py-3 border-t border-white/10">
          <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">
            {fieldLabels.hallazgo}
          </dt>
          <dd className={`h-24 text-sm leading-relaxed line-clamp-4 ${hallazgo ? "text-slate-300" : "text-slate-600 italic"}`}>
            {hallazgo || naLabel}
          </dd>
        </div>
        <div className="py-3 border-t border-white/10">
          <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">
            {fieldLabels.siguiente}
          </dt>
          <dd className={`h-24 text-sm leading-relaxed line-clamp-4 ${siguiente ? "text-slate-400" : "text-slate-600 italic"}`}>
            {siguiente || naLabel}
          </dd>
        </div>
      </dl>

      <div className="mt-auto pt-5">
        <div className="min-h-[36px] flex flex-wrap items-center gap-2 mb-6">
          {project.tags && project.tags.length > 0 ? (
            project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center justify-center text-center bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-3 py-1.5 rounded uppercase font-bold tracking-tighter leading-none"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-600 italic">{naLabel}</span>
          )}
        </div>

        <Link
          href={`/laboratory/${project.slug}`}
          className="group inline-flex items-center gap-2 text-sm font-medium text-white border-b border-blue-500/40 pb-0.5 hover:text-blue-400 transition-colors"
        >
          {viewFullLabel}
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.article>
  )
}

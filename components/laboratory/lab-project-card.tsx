"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export interface LabProject {
  _id: string
  title: string
  description: string
  image?: string
  video?: string
  category: string
  tags: string[]
  github?: string
  demo?: string
  translations?: any
  labDetails?: {
    status?: "testing" | "completed" | "discontinued" | "evolved"
  }
}

interface LabProjectCardProps {
  project: LabProject
  index: number
  languageCode: string
  statusLabels: Record<string, string>
}

export function LabProjectCard({ project: proj, index, languageCode, statusLabels }: LabProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden bg-zinc-900/40 border border-white/10 backdrop-blur-md hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-500 h-full relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative h-44 overflow-hidden">
          {/* Capa 1: Imagen de Respaldo (Siempre visible) */}
          <img
            src={proj.image || "/placeholder.svg"}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={proj.title}
          />

          {/* Capa 2: Video (Se carga encima) */}
          {proj.video && (
            <video
              src={proj.video}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              onCanPlay={(e) => (e.currentTarget.style.opacity = "0.7")}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />

          {proj.labDetails?.status && (
            <span className="absolute top-3 left-3 bg-blue-600/90 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider z-20">
              {statusLabels[proj.labDetails.status]}
            </span>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Link href={`/laboratory/${proj._id}`}>
              <h3 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm hover:from-blue-400 hover:to-blue-200 transition-all">
                {languageCode === "es" ? proj.title : proj.translations?.en?.title || proj.title}
              </h3>
            </Link>
          </div>
        </div>
        <CardContent className="p-6 relative z-10 min-h-[180px] flex flex-col">
          <p className="text-slate-400 mb-4 line-clamp-3">
            {languageCode === "es" ? proj.description : proj.translations?.en?.description || proj.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {proj.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

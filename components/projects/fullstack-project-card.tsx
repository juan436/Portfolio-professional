"use client"

import { motion } from "framer-motion";
import { LocalizedLink as Link } from "@/components/common/localized-link"
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { getProjectTechnologies } from "@/lib/utils";
import type { Project } from "@/contexts/content/types";

/**
 * Card de proyecto web/mobile con imagen destacada (grid de Projects en /work).
 * Recibe: `project: Project` + `index` (delay de animación / prioridad de carga de imagen).
 * Produce: card completa clickeable a `/projects/[slug]` — sin botones de demo/code
 * (esos viven en la ficha de detalle), mismo patrón que `AgentCard`.
 */
interface FullStackProjectCardProps {
  project: Project;
  index: number;
}

export function FullStackProjectCard({ project, index }: FullStackProjectCardProps) {
  const imageUrl = project.image || "/placeholder.svg?height=400&width=600";
  const technologies = getProjectTechnologies(project);

  return (
    <Link href={`/projects/${project.slug || project.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="h-full"
      >
        <Card className="overflow-hidden bg-zinc-900/40 border border-white/10 backdrop-blur-md hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-500 h-full relative group cursor-pointer">
          {/* Efecto Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative h-56 overflow-hidden">
            <Image
              src={imageUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent"></div>
            {project.subtype && (
              <span className="absolute top-3 left-3 bg-blue-600/90 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">
                {project.subtype}
              </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm group-hover:from-blue-400 group-hover:to-blue-200 transition-all">
                {project.title}
              </h3>
            </div>
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-slate-400 mb-4 line-clamp-2">{project.description}</p>

            <div className="flex flex-wrap gap-2">
              {technologies.map((tag: string) => (
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
    </Link>
  );
}

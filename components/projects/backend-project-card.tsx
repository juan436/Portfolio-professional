"use client"

import { motion } from "framer-motion";
import { Server, Database, Terminal } from "lucide-react";
import { LocalizedLink as Link } from "@/components/common/localized-link"
import { Card, CardContent } from "@/components/ui/card";
import { getProjectTechnologies } from "@/lib/utils";
import type { Project } from "@/contexts/content/types";

/**
 * Card de proyecto backend/infra (grid de Projects en /work, tab Infra & Backend).
 * Recibe: `project: Project` + `index` (delay de animación).
 * Produce: card completa clickeable a `/projects/[slug]` — sin botones de repo/docs
 * (esos viven en la ficha de detalle), mismo patrón que `AgentCard`.
 */
interface BackendProjectCardProps {
  project: Project;
  index: number;
}

export function BackendProjectCard({ project, index }: BackendProjectCardProps) {
  const technologies = getProjectTechnologies(project);

  const getIconForProject = (projectId: number) => {
    if (projectId % 3 === 0) {
      return <Server className="h-8 w-8 text-blue-500 mr-3" />;
    } else if (projectId % 3 === 1) {
      return <Database className="h-8 w-8 text-blue-500 mr-3" />;
    } else {
      return <Terminal className="h-8 w-8 text-blue-500 mr-3" />;
    }
  };

  return (
    <Link href={`/projects/${project.slug || project.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="h-full"
      >
        <Card className="bg-zinc-900/40 border border-white/10 backdrop-blur-md hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-500 h-full relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />

          <CardContent className="p-6 relative z-10 flex flex-col h-full">
            <div className="flex items-center mb-4">
              {getIconForProject(project.id)}
              <h3 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm group-hover:from-blue-400 group-hover:to-blue-200 transition-all">
                {project.title}
              </h3>
            </div>

            <p className="text-slate-400 mb-6 line-clamp-3">{project.description}</p>

            <div className="flex flex-wrap gap-2 mt-auto">
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

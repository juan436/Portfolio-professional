"use client"

import { motion } from "framer-motion";
import { ExternalLink, Github, Server, Database, Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { getProjectTechnologies } from "@/lib/utils";
import type { Project } from "@/contexts/content/types";

/**
 * Card de proyecto backend/infra (usada en /projects/[slug] relacionados o listados legacy).
 * Recibe: `project: Project` + `index` (delay de animación).
 * Produce: card con ícono variable por id, tags de tecnología, links a repo/docs.
 */
interface BackendProjectCardProps {
  project: Project;
  index: number;
}

export function BackendProjectCard({ project, index }: BackendProjectCardProps) {
  const { t } = useLanguage();
  const technologies = getProjectTechnologies(project);

  // Función para obtener el icono según el ID del proyecto
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="bg-zinc-900/40 border border-white/10 backdrop-blur-md hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-500 h-full relative group">
        {/* Efecto Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
        
        <CardContent className="p-6 relative z-10 flex flex-col h-full">
          <div className="flex items-center mb-4">
            {getIconForProject(project.id)}
            <Link href={`/projects/${project.slug || project.id}`}>
              <h3 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm hover:from-blue-400 hover:to-blue-200 transition-all">
                {project.title}
              </h3>
            </Link>
          </div>

          <p className="text-slate-400 mb-6 line-clamp-3">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {technologies.length > 0 ? (
              technologies.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter"
                >
                  {tag}
                </span>
              ))
            ) : null}
          </div>

          <div className="flex gap-4 mt-auto">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-blue-700/50 text-blue-500 hover:bg-blue-700/10 transition-colors duration-300"
            >
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {String(t("projects.repo"))}
              </a>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 transition-all duration-300">
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {String(t("projects.docs"))}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

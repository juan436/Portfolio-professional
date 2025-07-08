"use client"

import { motion } from "framer-motion";
import { ExternalLink, Github, Server, Database, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import type { Project } from "@/contexts/content/types";

interface BackendProjectCardProps {
  project: Project;
  index: number;
}

export function BackendProjectCard({ project, index }: BackendProjectCardProps) {
  const { t } = useLanguage();

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
      <Card className="bg-black/40 border-blue-700/20 hover:border-blue-700/50 transition-all duration-300 h-full">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            {getIconForProject(project.id)}
            <h3 className="text-xl font-semibold">{project.title}</h3>
          </div>

          <p className="text-slate-400 mb-6">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags && project.tags.length > 0 ? (
              project.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-blue-700/10 text-blue-400 border border-blue-700/20"
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
              className="border-blue-700/50 text-blue-500 hover:bg-blue-700/10"
            >
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {String(t("projects.repo"))}
              </a>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
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

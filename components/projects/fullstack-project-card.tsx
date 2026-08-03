"use client"

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useLanguage } from "@/hooks/use-language";
import { getProjectTechnologies } from "@/lib/utils";
import type { Project } from "@/contexts/content/types";

interface FullStackProjectCardProps {
  project: Project;
  index: number;
}

export function FullStackProjectCard({ project, index }: FullStackProjectCardProps) {
  const { t } = useLanguage();

  // Usar una imagen de respaldo si project.image es undefined
  const imageUrl = project.image || "/placeholder.svg?height=400&width=600";
  const technologies = getProjectTechnologies(project);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden bg-zinc-900/40 border border-white/10 backdrop-blur-md hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-500 h-full relative group">
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
            <Link href={`/projects/${project.id}`}>
              <h3 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm hover:from-blue-400 hover:to-blue-200 transition-all">
                {project.title}
              </h3>
            </Link>
          </div>
        </div>
        <CardContent className="p-6 relative z-10">
          <p className="text-slate-400 mb-4 line-clamp-2">{project.description}</p>

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

          <div className="flex gap-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-blue-700/50 text-blue-500 hover:bg-blue-700/10 transition-colors duration-300"
            >
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {String(t("projects.code"))}
              </a>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 transition-all duration-300">
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                {String(t("projects.demo"))}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

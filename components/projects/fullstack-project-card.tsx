"use client"

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useLanguage } from "@/hooks/use-language";
import type { Project } from "@/contexts/content/types";

interface FullStackProjectCardProps {
  project: Project;
  index: number;
}

export function FullStackProjectCard({ project, index }: FullStackProjectCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden bg-black/40 border-blue-700/20 hover:border-blue-700/50 transition-all duration-300 h-full">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={project.image || "/placeholder.svg?height=400&width=600"}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-semibold text-white drop-shadow-md">{project.title}</h3>
          </div>
        </div>
        <CardContent className="p-6">
          <p className="text-slate-400 mb-4">{project.description}</p>

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

          <div className="flex gap-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-blue-700/50 text-blue-500 hover:bg-blue-700/10"
            >
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {String(t("projects.code"))}
              </a>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
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

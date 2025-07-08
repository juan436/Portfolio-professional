"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Project } from "@/contexts/content/types"

interface ProjectsTableProps {
  projects: Project[]
  selectedProject: Project | null
  onSelectProject: (project: Project) => void
  onDeleteProject: (id: number) => void
  handleOpenDeleteDialog: (id: number) => void
  title: string
  description: string
}

export default function ProjectsTable({
  projects,
  selectedProject,
  onSelectProject,
  onDeleteProject,
  handleOpenDeleteDialog,
  title,
  description
}: ProjectsTableProps) {
  // Ordenar proyectos por fecha de creación (más reciente primero)
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
  )

  return (
    <Card className="bg-black/40 border-blue-700/20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {sortedProjects.length > 0 ? (
            sortedProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-md cursor-pointer relative group ${
                  selectedProject?.id === project.id
                    ? "bg-blue-900/30 border border-blue-500"
                    : "bg-black/20 border border-blue-700/20 hover:border-blue-700/50"
                }`}
                onClick={() => onSelectProject(project)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm truncate pr-8">{project.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-1 absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDeleteDialog(project.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-white/60 mt-1 truncate">{project.description}</p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400">No hay proyectos disponibles.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Server, Smartphone, Layers, LayoutGrid, type LucideIcon } from "lucide-react"
import { FullStackProjectCard } from "./fullstack-project-card"
import { BackendProjectCard } from "./backend-project-card"
import { PaginationControls } from "@/components/pagination-controls"
import type { Project } from "@/contexts/content/types"

type CategoryKey = "systems" | "mobile" | "backend"

interface ProjectWithCategory extends Project {
  category: CategoryKey
}

interface ProjectsGridProps {
  localProjects: {
    systems: Project[]
    mobile: Project[]
    backend: Project[]
  }
  isLoading: boolean
  translatedTexts: {
    systems: string
    mobile: string
    backend: string
    all: string
    noProjects: string
    [key: string]: string
  }
}

const PAGE_SIZE = 6

export function ProjectsGrid({ localProjects, isLoading, translatedTexts }: ProjectsGridProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | CategoryKey>("all")
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [activeFilter])

  const allProjects: ProjectWithCategory[] = [
    ...localProjects.systems.map((p) => ({ ...p, category: "systems" as const })),
    ...localProjects.mobile.map((p) => ({ ...p, category: "mobile" as const })),
    ...localProjects.backend.map((p) => ({ ...p, category: "backend" as const })),
  ]

  const filters: { id: "all" | CategoryKey; icon: LucideIcon; label: string; count: number }[] = [
    { id: "all" as const, icon: LayoutGrid, label: translatedTexts.all, count: allProjects.length },
    { id: "systems" as const, icon: Layers, label: translatedTexts.systems, count: localProjects.systems.length },
    { id: "mobile" as const, icon: Smartphone, label: translatedTexts.mobile, count: localProjects.mobile.length },
    { id: "backend" as const, icon: Server, label: translatedTexts.backend, count: localProjects.backend.length },
  ].filter((f) => f.id === "all" || f.count > 0)

  const filteredProjects = activeFilter === "all" ? allProjects : allProjects.filter((p) => p.category === activeFilter)
  const paginatedProjects = filteredProjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
      </div>
    )
  }

  if (allProjects.length === 0) {
    return <div className="text-center py-12 text-slate-500">{translatedTexts.noProjects}</div>
  }

  return (
    <div>
      {filters.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors duration-300 ${
                activeFilter === f.id
                  ? "bg-blue-700/20 border-blue-500/50 text-blue-400"
                  : "bg-black/40 border-white/10 text-slate-400 hover:border-blue-500/30 hover:text-blue-400"
              }`}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
              <span className="opacity-60 text-xs">{f.count}</span>
            </button>
          ))}
        </div>
      )}

      <motion.div
        key={activeFilter}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {paginatedProjects.map((project, index) =>
          project.category === "backend" ? (
            <BackendProjectCard key={project.id} project={project} index={index} />
          ) : (
            <FullStackProjectCard key={project.id} project={project} index={index} />
          )
        )}
      </motion.div>

      <PaginationControls
        currentPage={page}
        totalPages={Math.ceil(filteredProjects.length / PAGE_SIZE)}
        onPageChange={setPage}
      />
    </div>
  )
}

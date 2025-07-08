"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { Skill } from "@/contexts/content/types"

interface SkillsTableProps {
  skills: Skill[]
  onEdit: (skill: Skill) => void
  onDelete: (skill: Skill) => void
  renderDevIcon: (iconName: string, colored?: boolean) => React.ReactNode
}

export default function SkillsTable({
  skills,
  onEdit,
  onDelete,
  renderDevIcon,
}: SkillsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-blue-700/20 hover:bg-blue-900/10">
            <TableHead className="w-[50px]">Icono</TableHead>
            <TableHead>Habilidad</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skills.length === 0 ? (
            <TableRow key="no-skills" className="border-blue-700/20 hover:bg-blue-900/10">
              <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                No hay habilidades disponibles. Haz clic en "Nueva Habilidad" para añadir una.
              </TableCell>
            </TableRow>
          ) : (
            skills.map((skill) => (
              <TableRow key={skill.name} className="border-blue-700/20 hover:bg-blue-900/10">
                <TableCell>
                  <div className="h-10 w-10 flex items-center justify-center bg-black/30 rounded-md p-1">
                    {renderDevIcon(skill.icon, skill.colored !== false)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{skill.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(skill)}
                      className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-900/20"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(skill)}
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

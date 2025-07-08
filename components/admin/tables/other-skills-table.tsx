"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface OtherSkill {
  _id?: string
  id?: string
  name: string
  createdAt?: string
  updatedAt?: string
  __v?: number
}

interface OtherSkillsTableProps {
  skills: OtherSkill[] | string[]
  onEdit: (skill: OtherSkill | string) => void
  onDelete: (skill: OtherSkill | string) => void
}

export default function OtherSkillsTable({
  skills,
  onEdit,
  onDelete,
}: OtherSkillsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-blue-700/20 hover:bg-blue-900/10">
            <TableHead>Habilidad</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skills.length === 0 ? (
            <TableRow key="no-other-skills" className="border-blue-700/20 hover:bg-blue-900/10">
              <TableCell colSpan={2} className="text-center py-8 text-slate-400">
                No hay habilidades adicionales disponibles. Haz clic en "Nueva Habilidad Adicional" para añadir una.
              </TableCell>
            </TableRow>
          ) : (
            skills.map((skill, index) => {
              const displayValue = typeof skill === 'string' ? skill : skill.name;
              const itemKey = typeof skill === 'string' ? skill : (skill._id || skill.id || index.toString());
              
              return (
                <TableRow key={itemKey} className="border-blue-700/20 hover:bg-blue-900/10">
                  <TableCell className="font-medium">{displayValue}</TableCell>
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
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

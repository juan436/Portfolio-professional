"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { renderSkillIcon } from "@/lib/devicon-utils"

interface SkillCardProps {
  skill: {
    name: string
    icon: string
    colored?: boolean
  }
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <motion.div
      key={skill.name}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
    >
      <Card className="bg-black/40 border-blue-700/20 hover:border-blue-700/50 transition-all duration-300 h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">{renderSkillIcon(skill)}</div>
          <h3 className="text-sm font-medium">{skill.name}</h3>
        </CardContent>
      </Card>
    </motion.div>
  )
}

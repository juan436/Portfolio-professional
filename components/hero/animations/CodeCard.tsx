"use client"

import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Code, Server, Database, Layers, RotateCcw } from "lucide-react"

/**
 * Cara "código" del avatar del Hero — flip 3D al hacer click sobre la foto de perfil.
 * Recibe: `codeLines: string[]` (líneas ya armadas por el caller) + `onClose`.
 * Produce: card animada con líneas de código, iconos de stack y botón "volver".
 *
 * Optimización (2026-08-31): se quitaron las 20 partículas de fondo que se
 * montaban en el flip (el click "laggeaba" al renderizar) y los `type: "spring"`
 * (rebotes caros + rompían el tipo `Variants` de TS). Entrada por tween corto.
 */
interface CodeCardProps {
  codeLines: string[]
  onClose: () => void
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
}

export function CodeCard({ codeLines, onClose }: CodeCardProps) {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: 90, opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-900 rounded-full flex flex-col items-center justify-center overflow-hidden"
      style={{ willChange: "transform" }}
    >
      <div className="absolute inset-0 flex flex-col justify-center items-center p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-xs md:text-sm font-mono text-blue-300 mb-4 w-full max-w-[85%]"
        >
          {codeLines.map((line, index) => (
            <div key={index} className="whitespace-nowrap overflow-hidden text-ellipsis text-center">
              {line}
            </div>
          ))}
        </motion.div>

        {/* Iconos de tecnologías */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center space-x-4 mt-2"
        >
          {[Code, Server, Database, Layers].map((Icon, i) => (
            <motion.div key={i} variants={itemVariants} className="p-2 bg-blue-800/50 rounded-full">
              <Icon className="h-4 w-4 text-blue-300" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="mt-4"
        >
          <Button
            onClick={onClose}
            size="sm"
            className="bg-blue-800/50 hover:bg-blue-700/60 text-blue-300 border border-blue-300/30 rounded-full px-4 py-1 text-xs flex items-center gap-1 transition-colors duration-300"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Volver
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

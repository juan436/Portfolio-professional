"use client"

import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Code, Server, Database, Layers, RotateCcw } from "lucide-react"

/**
 * Cara "código" del avatar del Hero — flip 3D al hacer click sobre la foto de perfil.
 * Recibe: `codeLines: string[]` (líneas ya armadas por el caller) + `onClose`.
 * Produce: mini panel de terminal con el snippet resaltado + iconos de stack + botón "volver".
 *
 * Optimización (2026-08-31): se quitaron las 20 partículas de fondo que se
 * montaban en el flip (el click "laggeaba" al renderizar) y los `type: "spring"`
 * (rebotes caros + rompían el tipo `Variants` de TS). El código va en un panel
 * alineado a la izquierda y resaltado para que se lea de verdad.
 */
interface CodeCardProps {
  codeLines: string[]
  onClose: () => void
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
}

function highlight(line: string) {
  const chunks = line.split(/('[^']*')/g)
  return (
    <>
      {chunks.map((chunk, i) => {
        if (chunk.startsWith("'") && chunk.endsWith("'")) {
          return (
            <span key={i} className="text-emerald-400">
              {chunk}
            </span>
          )
        }
        return chunk.split(/(\bconst\b|\blet\b|[{}[\],:;])/g).map((tk, j) => {
          if (tk === "const" || tk === "let") {
            return (
              <span key={j} className="text-fuchsia-400">
                {tk}
              </span>
            )
          }
          if (/^[{}[\],:;]$/.test(tk)) {
            return (
              <span key={j} className="text-slate-500">
                {tk}
              </span>
            )
          }
          return (
            <span key={j} className="text-sky-200">
              {tk}
            </span>
          )
        })
      })}
    </>
  )
}

export function CodeCard({ codeLines, onClose }: CodeCardProps) {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: 90, opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center overflow-hidden"
      style={{ willChange: "transform", transformPerspective: 1000 }}
    >
      <div className="flex flex-col items-center gap-4 px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.3 }}
          className="w-[72%] max-w-[220px] rounded-lg border border-blue-500/20 bg-slate-950/85 shadow-lg shadow-black/40 overflow-hidden"
        >
          <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
            <span className="h-2 w-2 rounded-full bg-green-400/70" />
          </div>
          <pre className="px-3 py-2.5 text-left font-mono text-[10px] md:text-[11px] leading-relaxed whitespace-pre-wrap break-words">
            {codeLines.map((line, i) => (
              <div key={i}>{highlight(line)}</div>
            ))}
          </pre>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center gap-3"
        >
          {[Code, Server, Database, Layers].map((Icon, i) => (
            <motion.div key={i} variants={itemVariants} className="rounded-full bg-blue-800/50 p-2">
              <Icon className="h-4 w-4 text-blue-300" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        >
          <Button
            onClick={onClose}
            size="sm"
            className="flex items-center gap-1 rounded-full border border-blue-300/30 bg-blue-800/50 px-4 py-1 text-xs text-blue-300 transition-colors duration-300 hover:bg-blue-700/60"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Volver
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

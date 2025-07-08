"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Code, Server, Database, Layers, RotateCcw } from "lucide-react"

interface CodeCardProps {
  codeLines: string[]
  onClose: () => void
}

export function CodeCard({ codeLines, onClose }: CodeCardProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <motion.div
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      exit={{ rotateY: 90 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-900 rounded-full flex flex-col items-center justify-center overflow-hidden"
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      {/* Partículas de fondo */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            opacity: 0,
          }}
          animate={{
            x: Math.random() * 300 - 150,
            y: Math.random() * 300 - 150,
            opacity: [0, 0.5, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3 + Math.random() * 5,
            delay: Math.random() * 2,
          }}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
        />
      ))}

      {/* Líneas de código */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs md:text-sm font-mono text-blue-300 mb-4 w-full max-w-[85%]"
        >
          {codeLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="whitespace-nowrap overflow-hidden text-center"
              style={{ textOverflow: "ellipsis" }}
            >
              {line}
            </motion.div>
          ))}
        </motion.div>

        {/* Iconos de tecnologías */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center space-x-4 mt-2"
        >
          <motion.div variants={itemVariants} className="p-2 bg-blue-800/50 rounded-full">
            <Code className="h-4 w-4 text-blue-300" />
          </motion.div>
          <motion.div variants={itemVariants} className="p-2 bg-blue-800/50 rounded-full">
            <Server className="h-4 w-4 text-blue-300" />
          </motion.div>
          <motion.div variants={itemVariants} className="p-2 bg-blue-800/50 rounded-full">
            <Database className="h-4 w-4 text-blue-300" />
          </motion.div>
          <motion.div variants={itemVariants} className="p-2 bg-blue-800/50 rounded-full">
            <Layers className="h-4 w-4 text-blue-300" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
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

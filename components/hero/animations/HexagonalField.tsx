"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function HexagonalField() {
  // Estado para controlar si estamos en el cliente
  const [isMounted, setIsMounted] = useState(false)
  
  // Efecto que se ejecuta solo en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // No renderizar nada durante SSR
  if (!isMounted) {
    return null
  }
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Hexágonos concéntricos */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`hex-${i}`}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: { duration: 20 + i * 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, delay: i * 0.5 },
          }}
          className="absolute border border-blue-500/30 rounded-full"
          style={{
            width: `${300 + i * 40}px`,
            height: `${300 + i * 40}px`,
            clipPath: "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
            background: `conic-gradient(from ${i * 45}deg, transparent 0%, rgba(59, 130, 246, 0.05) 16.66%, transparent 33.33%, rgba(59, 130, 246, 0.1) 50%, transparent 66.66%, rgba(59, 130, 246, 0.05) 83.33%, transparent 100%)`,
          }}
        />
      ))}
    </div>
  )
}

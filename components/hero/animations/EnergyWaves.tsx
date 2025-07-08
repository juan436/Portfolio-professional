"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function EnergyWaves() {
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
    <>
      {/* Ondas de energía cuántica */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`quantum-wave-${i}`}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{
            scale: [0, 2.5, 0],
            opacity: [0.8, 0.2, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 1.7,
            ease: "easeOut",
          }}
          className="absolute inset-0 border-2 border-blue-400/40 rounded-full"
          style={{
            background: "radial-gradient(circle, transparent 70%, rgba(59, 130, 246, 0.1) 100%)",
          }}
        />
      ))}
    </>
  )
}

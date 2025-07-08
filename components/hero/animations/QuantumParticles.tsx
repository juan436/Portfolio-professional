"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function QuantumParticles() {
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
      {/* Partículas cuánticas */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`quantum-particle-${i}`}
          initial={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: 0,
          }}
          animate={{
            x: [Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200],
            y: [Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200],
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
          className="absolute w-1 h-1 bg-blue-500 rounded-full shadow-md shadow-blue-500/50"
          style={{
            boxShadow: "0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.4)",
          }}
        />
      ))}
    </>
  )
}

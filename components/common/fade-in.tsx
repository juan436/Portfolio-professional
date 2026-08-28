"use client"

import { motion } from "framer-motion"

/**
 * Wrapper de aparición al entrar en viewport — `opacity 0→1` + un pequeño
 * desplazamiento. Reemplaza el `motion.div initial/whileInView/transition/
 * viewport` que estaba repetido ~45 veces en las vistas de detalle.
 * Recibe: `y`/`x` (desplazamiento inicial, default `y: 20`), `delay`, `duration`
 * (default 0.5), `className`, `children`.
 */
export function FadeIn({
  children,
  className,
  y = 20,
  x = 0,
  delay = 0,
  duration = 0.5,
}: {
  children: React.ReactNode
  className?: string
  y?: number
  x?: number
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration, delay }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

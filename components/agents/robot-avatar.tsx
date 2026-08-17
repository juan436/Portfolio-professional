"use client"

import { motion } from "framer-motion"

// Robot literal (busto: antena, cabeza, pantalla con ojos, hombros) en vez de
// un ícono genérico — así una card de Agente se reconoce a simple vista, sin
// leer el texto. Colores reaccionan a :hover del `group` (la card entera)
// vía utilidades fill-*/stroke-* de Tailwind sobre SVG, sin JS.
export function RobotAvatar() {
  return (
    <motion.div
      className="relative w-24 h-24 mx-auto"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_18px_rgba(59,130,246,0.55)] transition-[filter] duration-300"
      >
        <line
          x1="50" y1="8" x2="50" y2="18"
          className="stroke-blue-500/50 group-hover:stroke-blue-400 transition-colors"
          strokeWidth="2"
        />
        <circle cx="50" cy="6" r="4" className="fill-blue-500/50 group-hover:fill-blue-400 transition-colors" />

        <rect
          x="14" y="32" width="8" height="14" rx="3"
          className="fill-zinc-800 stroke-blue-500/30 group-hover:stroke-blue-400/70 transition-colors"
          strokeWidth="2"
        />
        <rect
          x="78" y="32" width="8" height="14" rx="3"
          className="fill-zinc-800 stroke-blue-500/30 group-hover:stroke-blue-400/70 transition-colors"
          strokeWidth="2"
        />

        <rect
          x="22" y="18" width="56" height="42" rx="14"
          className="fill-zinc-800 stroke-blue-500/40 group-hover:stroke-blue-400 transition-colors"
          strokeWidth="2"
        />

        <rect x="30" y="27" width="40" height="24" rx="8" className="fill-black/60" />
        <circle cx="42" cy="39" r="4.5" className="fill-blue-500/50 group-hover:fill-blue-400 transition-colors" />
        <circle cx="58" cy="39" r="4.5" className="fill-blue-500/50 group-hover:fill-blue-400 transition-colors" />
        <rect x="40" y="46" width="20" height="2.5" rx="1.25" className="fill-blue-500/30 group-hover:fill-blue-400/70 transition-colors" />

        <path
          d="M28 60 Q50 52 72 60 L78 78 Q50 86 22 78 Z"
          className="fill-zinc-800/80 stroke-blue-500/30 group-hover:stroke-blue-400/60 transition-colors"
          strokeWidth="2"
        />
        <circle cx="50" cy="68" r="4" className="fill-blue-500/40 group-hover:fill-blue-400 transition-colors" />
      </svg>
    </motion.div>
  )
}

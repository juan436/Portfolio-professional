"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

/**
 * Partes 100% idénticas del SVG del lobo entre `IdlePose` (widget flotante) y
 * `RobotWolf` (overlay de bienvenida): cuerpo, chest core, hombros, piernas,
 * pies, remaches — mismas coordenadas exactas en los 2 archivos originales
 * (auditoría 2026-08-18 §6.1, cerrada 2026-08-20 para los 2 archivos que
 * sobrevivieron al rediseño "Plan Lobo"). Slots para lo que sí cambia entre
 * las 2 poses (contenido Y animación, no solo estilo).
 * Recibe: `head`/`arms`/`tail` (contenido de cada pose); `neck`/`extra` (opcionales, `IdlePose` los usa para el cuello y el laptop, `RobotWolf` no los pasa); `chestPulse` (si el punto naranja del pecho pulsa, como en `RobotWolf`).
 * Produce: el `<g>` completo del cuerpo del lobo, slots insertados en el mismo orden de pintado que tenían los 2 archivos originales (importa para que los remaches/hombros sigan encima de los brazos).
 */
export function WolfBase({
  head,
  neck,
  arms,
  tail,
  extra,
  chestPulse = false,
}: {
  head: ReactNode
  neck?: ReactNode
  arms: ReactNode
  tail: ReactNode
  extra?: ReactNode
  chestPulse?: boolean
}) {
  return (
    <g>
      {/* Main body */}
      <rect x="40" y="50" width="30" height="25" rx="5" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

      {/* Chest core */}
      <circle cx="55" cy="60" r="6" fill="#1A3E4C" stroke="#1A3E4C" strokeWidth="1" />
      {chestPulse ? (
        <motion.g
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: 2, duration: 1 }}
          originX={55}
          originY={60}
        >
          <circle cx="55" cy="60" r="4" fill="#F39C12" />
        </motion.g>
      ) : (
        <circle cx="55" cy="60" r="4" fill="#F39C12" />
      )}
      <circle cx="55" cy="60" r="2" fill="#F5B041" />

      {head}
      {neck}
      {arms}

      <circle cx="35" cy="55" r="3" fill="#1A3E4C" />
      <circle cx="75" cy="55" r="3" fill="#1A3E4C" />

      {/* Legs */}
      <rect x="40" y="75" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
      <rect x="60" y="75" width="10" height="15" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
      <circle cx="45" cy="75" r="3" fill="#1A3E4C" />
      <circle cx="65" cy="75" r="3" fill="#1A3E4C" />

      {/* Feet */}
      <rect x="38" y="90" width="14" height="6" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />
      <rect x="58" y="90" width="14" height="6" rx="3" fill="#2A7B9B" stroke="#1A3E4C" strokeWidth="2" />

      {tail}
      {extra}

      {/* Details - rivets and panels */}
      <circle cx="42" cy="55" r="1" fill="#1A3E4C" />
      <circle cx="68" cy="55" r="1" fill="#1A3E4C" />
      <circle cx="42" cy="65" r="1" fill="#1A3E4C" />
      <circle cx="68" cy="65" r="1" fill="#1A3E4C" />
      <circle cx="45" cy="28" r="1" fill="#1A3E4C" />
      <circle cx="65" cy="28" r="1" fill="#1A3E4C" />
    </g>
  )
}

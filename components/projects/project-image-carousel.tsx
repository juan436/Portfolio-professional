"use client"

import { useState } from "react"
import { AnimatePresence, motion, type PanInfo, type Variants } from "framer-motion"

interface ProjectImageCarouselProps {
  images: string[]
  alt: string
}

const STACK_OFFSETS = [
  { y: 0, scale: 1, rotate: 0, zIndex: 30, opacity: 1 },
  { y: 14, scale: 0.94, rotate: -5, zIndex: 20, opacity: 0.9 },
  { y: 24, scale: 0.89, rotate: 6, zIndex: 10, opacity: 0.75 },
]

// La carta que recién entra al fondo del mazo parte de más adentro, chica y
// transparente, en vez de aparecer de golpe.
const INCOMING_CARD_INITIAL = { y: 32, scale: 0.83, rotate: 8, opacity: 0 }

const SWIPE_THRESHOLD = 100

const cardVariants: Variants = {
  exit: (direction: number) => ({
    x: direction > 0 ? 600 : -600,
    opacity: 0,
    rotate: direction > 0 ? 15 : -15,
    scale: 0.9,
    transition: { duration: 0.3, ease: "easeIn" },
  }),
}

export function ProjectImageCarousel({ images, alt }: ProjectImageCarouselProps) {
  const [order, setOrder] = useState<number[]>(() => images.map((_, i) => i))
  const [exitDirection, setExitDirection] = useState(1)
  const [hasSwiped, setHasSwiped] = useState(false)

  if (images.length === 0) return null

  const canSwipe = images.length > 1
  const visible = order.slice(0, Math.min(3, order.length))

  // El orden rota al soltar el drag, en el mismo evento — no hay ventana de
  // tiempo en la que el estado y lo que se ve puedan desincronizarse.
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      setExitDirection(info.offset.x > 0 ? 1 : -1)
      setOrder((prev) => [...prev.slice(1), prev[0]])
      setHasSwiped(true)
    }
  }

  return (
    <div className="relative mb-14">
      <div className="relative aspect-video">
        <AnimatePresence initial={false} custom={exitDirection}>
          {visible.map((imageIndex, stackPos) => {
            const isFront = stackPos === 0
            const offset = STACK_OFFSETS[stackPos]
            const isIncoming = hasSwiped && stackPos === 2

            return (
              <motion.div
                key={imageIndex}
                custom={exitDirection}
                variants={cardVariants}
                exit="exit"
                className={`absolute inset-0 rounded-xl overflow-hidden border border-white/10 bg-black select-none ${
                  isFront && canSwipe ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
                }`}
                style={{ zIndex: offset.zIndex }}
                drag={isFront && canSwipe ? "x" : false}
                dragElastic={0.6}
                onDragEnd={isFront && canSwipe ? handleDragEnd : undefined}
                initial={isIncoming ? INCOMING_CARD_INITIAL : false}
                animate={{ x: 0, y: offset.y, scale: offset.scale, rotate: offset.rotate, opacity: offset.opacity }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <img
                  src={images[imageIndex]}
                  alt={`${alt} ${imageIndex + 1}`}
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {canSwipe && (
        <div className="flex justify-center gap-2 mt-6">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === order[0] ? "w-6 bg-blue-500" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

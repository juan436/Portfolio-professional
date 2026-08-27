"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"

/**
 * Carrusel de media (imágenes + video) para el detalle de un proyecto.
 * Recibe: `media: MediaItem[]` + `alt`.
 * Produce: `null` si no hay media; si no, una slide grande a la vez (flechas +
 * puntos, sin recorte) que al clickearse abre un lightbox fullscreen.
 */
export interface MediaItem {
  type: "image" | "video"
  url: string
}

interface ProjectImageCarouselProps {
  media: MediaItem[]
  alt: string
}

export function ProjectImageCarousel({ media, alt }: ProjectImageCarouselProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const hasMultiple = media.length > 1

  const goTo = (next: number, dir: number) => {
    setDirection(dir)
    setIndex((next + media.length) % media.length)
  }
  const goNext = () => goTo(index + 1, 1)
  const goPrev = () => goTo(index - 1, -1)

  // Flechas del teclado solo mientras el lightbox está abierto — en la vista
  // normal del carrusel no tiene sentido capturar el teclado de toda la página.
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightboxOpen, index])

  if (media.length === 0) return null
  const current = media[index]

  return (
    <div className="relative mb-14">
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: direction >= 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -40 : 40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {current.type === "video" ? (
              <>
                <video src={current.url} controls className="w-full h-full object-contain" />
                <button
                  type="button"
                  aria-label="Pantalla completa"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <img
                src={current.url}
                alt={`${alt} ${index + 1}`}
                draggable={false}
                onClick={() => setLightboxOpen(true)}
                className="w-full h-full object-contain select-none cursor-zoom-in"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex justify-center gap-2 mt-6">
          {media.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a ${i + 1}`}
              onClick={() => goTo(i, i > index ? 1 : -1)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-blue-500" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}

      <DialogPrimitive.Root
        open={lightboxOpen}
        onOpenChange={(open) => {
          setLightboxOpen(open)
          if (!open) setZoomed(false)
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex items-center justify-center outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            aria-describedby={undefined}
          >
            <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>
            <DialogPrimitive.Close className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar</span>
            </DialogPrimitive.Close>

            {current.type === "video" ? (
              <video src={current.url} controls autoPlay className="max-h-[90vh] max-w-[92vw]" />
            ) : zoomed ? (
              // Zoom a resolución nativa (sin tope de tamaño) dentro de un contenedor con
              // scroll — para imágenes muy altas/anchas, se navega con rueda/trackpad/touch
              // en vez de quedar recortadas por el viewport.
              <div className="h-full w-full overflow-auto cursor-zoom-out" onClick={() => setZoomed(false)}>
                <img
                  src={current.url}
                  alt={`${alt} ${index + 1}`}
                  draggable={false}
                  className="mx-auto h-auto max-w-none select-none"
                />
              </div>
            ) : (
              <img
                src={current.url}
                alt={`${alt} ${index + 1}`}
                draggable={false}
                onClick={() => setZoomed(true)}
                className="max-h-[90vh] max-w-[92vw] object-contain select-none cursor-zoom-in"
              />
            )}

            {hasMultiple && (
              <>
                <button
                  type="button"
                  aria-label="Anterior"
                  onClick={(e) => {
                    e.stopPropagation()
                    setZoomed(false)
                    goPrev()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Siguiente"
                  onClick={(e) => {
                    e.stopPropagation()
                    setZoomed(false)
                    goNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}

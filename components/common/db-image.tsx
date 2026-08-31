"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Imagen que viene de la BD. Si `src` existe, la muestra (con shimmer mientras
 * carga y fade-in al terminar). Si no hay `src`, o la carga falla, deja el
 * skeleton pulsante — nunca cae a una imagen de relleno.
 * Recibe: `src` (URL de la BD), `alt`, `className` (tamaño/forma del contenedor:
 *   `w-11 h-11 rounded-full`, `aspect-[4/5]`, `w-full h-full`…), `imgClassName`
 *   (object-fit/position), `sizes`, `priority`.
 * Produce: `<div>` contenedor con `<Image fill>` + overlay skeleton.
 */
interface DbImageProps {
  src?: string | null
  alt: string
  className?: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
}

export function DbImage({
  src,
  alt,
  className,
  imgClassName,
  sizes = "(max-width: 768px) 100vw, 500px",
  priority,
}: DbImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const show = Boolean(src) && !errored

  return (
    <div className={cn("relative overflow-hidden bg-white/[0.04]", className)}>
      {(!show || !loaded) && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.02]" />
      )}
      {show && (
        <Image
          key={src as string}
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
    </div>
  )
}

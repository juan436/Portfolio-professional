"use client"

import { useRouter } from "next/navigation"

/**
 * Botón "volver" de las vistas de detalle: si hay historial real, `router.back()`;
 * si no (entrada directa por link), navega al listado (`fallbackPath`).
 * Reemplaza el `handleBack` copiado en agent-detail-view y automation-detail-view
 * (auditoría 2026-08-27 §4.16).
 */
export function useBackNavigation(fallbackPath: string) {
  const router = useRouter()
  return () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackPath)
    }
  }
}

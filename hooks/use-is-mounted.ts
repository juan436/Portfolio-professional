"use client"

import { useEffect, useState } from "react"

/**
 * No renderizar/animar durante SSR — reemplaza el patrón copiado en
 * components/hero/animations/ y en los 6 componentes con guard de hidratación (sesión 2026-08-19).
 * Recibe: nada.
 * @returns `boolean`, `false` en el primer render (server + hidratación), `true` después del mount.
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}

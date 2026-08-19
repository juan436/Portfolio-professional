"use client"

import { useEffect, useState } from "react"

/** No renderizar durante SSR — reemplaza el mismo patrón copiado 5 veces en components/hero/animations/ */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}

import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook de detección de viewport móvil (breakpoint 768px), reactivo a resize.
 * Recibe: nada.
 * @returns `boolean` — true si el ancho de ventana es menor al breakpoint.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

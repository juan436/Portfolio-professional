"use client"

// SVG solo (marca J/V/DEV) sin el wrapper de interacción — components/navbar/logo.tsx
// lo envuelve en un <button> que hace scroll-to-top; components/projects/project-header.tsx
// lo envuelve en un <Link href="/"> porque ahí no hay Home debajo para hacer scroll.
// Isotipo compacto real (logos/isotipo-compacto-bicolor.svg) — J/V en blanco +
// flecha azul. Reemplaza el logo J/V/DEV dibujado a mano.
export function LogoMark() {
  return (
    <svg
      width="63"
      height="48"
      viewBox="-9 -6 120 92"
      className="hover:scale-105 transition-transform duration-300"
    >
      <path d="M15,8 L15,44 L7,56" fill="none" stroke="#FFFFFF" strokeWidth="13" strokeMiterlimit="12" />
      <path d="M28,8 L46,50 L64,8" fill="none" stroke="#FFFFFF" strokeWidth="13" strokeMiterlimit="12" />
      <path d="M74,26 L94,44 L74,62" fill="none" stroke="#3b82f6" strokeWidth="12" strokeMiterlimit="12" />
    </svg>
  )
}

export function Logo() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="focus:outline-none"
    >
      <LogoMark />
    </button>
  )
}

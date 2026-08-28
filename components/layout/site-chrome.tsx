"use client"

import { usePathWithoutLocale } from "@/components/common/localized-link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

/**
 * Envoltorio de Navbar/Footer para el sitio público — se omite en `/admin` (tiene su propio chrome)
 * y en `/testimonial` (página standalone que se comparte por link directo, sin navegación del sitio).
 * Recibe: `children`.
 * Produce: `Navbar` + `children` + `Footer`, o solo `children` en esas rutas.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathWithoutLocale()
  const noChrome = pathname.startsWith("/admin") || pathname.startsWith("/testimonial")

  if (noChrome) return <>{children}</>

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

/**
 * Envoltorio de Navbar/Footer para el sitio público — se omite en `/admin` (tiene su propio chrome).
 * Recibe: `children`.
 * Produce: `Navbar` + `children` + `Footer`, o solo `children` si `pathname` empieza con `/admin`.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) return <>{children}</>

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

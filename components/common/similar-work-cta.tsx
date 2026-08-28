"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { FadeIn } from "@/components/common/fade-in"

/**
 * CTA "¿Necesitas algo similar?" al pie de las vistas de detalle
 * (project / automation / agent). Los 3 textos salen de `t("projects.cta*")`.
 * Recibe: `href` (destino del botón — varía entre `/contact` y `/#contact`).
 * Produce: caja azul con título + texto + botón.
 */
export function SimilarWorkCTA({ href }: { href: string }) {
  const { t } = useLanguage()
  const heading = String(t("projects.ctaHeading") || "¿Necesitas algo similar?")
  const text = String(t("projects.ctaText") || "Hablemos sobre tu proyecto.")
  const button = String(t("projects.ctaButton") || "Hablemos")

  return (
    <FadeIn className="mt-16 rounded-xl border border-blue-500/20 bg-blue-500/5 p-8 text-center">
      <h2 className="text-xl font-bold mb-2">{heading}</h2>
      <p className="text-slate-400 mb-6">{text}</p>
      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500">
        <Link href={href}>
          <MessageCircle className="mr-2 h-4 w-4" />
          {button}
        </Link>
      </Button>
    </FadeIn>
  )
}

"use client"

import { LocalizedLink as Link } from "@/components/common/localized-link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { FadeIn } from "@/components/common/fade-in"

/**
 * CTA "¿Necesitas algo similar?" al pie de las vistas de detalle
 * (project / automation / agent). Los 3 textos salen de `t("projects.cta*")`.
 * El botón lleva al chat de Jevy (`/contact`). Si se pasa `reference`, deja en
 * `sessionStorage` de qué ficha viene el visitante — el mismo patrón que
 * `jevy_initial_service` de las cards de Servicios — para que Jevy arranque el
 * levantamiento reconociendo ese proyecto. El `slug` es la clave de búsqueda
 * (exacta, sin acentos, igual en todos los idiomas); el `title` es solo para
 * el mensaje que se auto-envía en nombre del visitante.
 */
export function SimilarWorkCTA({ reference }: { reference?: { slug: string; title: string } }) {
  const { t } = useLanguage()
  const heading = String(t("projects.ctaHeading") || "¿Necesitas algo similar?")
  const text = String(t("projects.ctaText") || "Hablemos sobre tu proyecto.")
  const button = String(t("projects.ctaButton") || "Hablemos")

  const rememberReference = () => {
    if (!reference) return
    try {
      sessionStorage.setItem("jevy_reference_project", JSON.stringify(reference))
    } catch {
    }
  }

  return (
    <FadeIn className="mt-16 rounded-xl border border-blue-500/20 bg-blue-500/5 p-8 text-center">
      <h2 className="text-xl font-bold mb-2">{heading}</h2>
      <p className="text-slate-400 mb-6">{text}</p>
      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500">
        <Link href="/contact" onClick={rememberReference}>
          <MessageCircle className="mr-2 h-4 w-4" />
          {button}
        </Link>
      </Button>
    </FadeIn>
  )
}

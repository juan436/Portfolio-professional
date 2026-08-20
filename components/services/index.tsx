"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useTranslatedContent } from "@/hooks/use-translated-content"
import { useTranslatedTexts } from "@/hooks/use-translated-texts"
import { useIsMounted } from "@/hooks/use-is-mounted"
import { Card, CardContent } from "@/components/ui/card"
import { Code2, Check, ArrowRight } from "lucide-react"
import { getServiceIconComponent, serviceIconMap } from "@/lib/service-icon-map"

function getServiceKey(title: string): "automation" | "mobile" | "infra" | "web" {
  const lower = title.toLowerCase()
  if (lower.includes('ia') || lower.includes('inteligencia') || lower.includes('ai') || lower.includes('automatización') || lower.includes('automation')) {
    return 'automation'
  }
  if (lower.includes('móvil') || lower.includes('mobile') || lower.includes('app')) {
    return 'mobile'
  }
  if (lower.includes('infraestructura') || lower.includes('infrastructure') || lower.includes('cloud') || lower.includes('ops') || lower.includes('backend')) {
    return 'infra'
  }
  return 'web'
}

/**
 * Sección "Servicios" del home.
 * Recibe: nada (lee `translatedContent.services` del context).
 * Produce: grid de cards con ícono/pitch/beneficios/CTA (la CTA varía según `getServiceKey` del título).
 */
export default function Services() {
  const { translatedContent } = useTranslatedContent()
  const isMounted = useIsMounted()
  const translatedTexts = useTranslatedTexts(
    (t) => ({
      title: String(t("services.title")),
      subtitle: String(t("services.subtitle")),
      consultSolution: String(t("services.consultSolution")),
      webCTA: String(t("ctas.services.web")),
      mobileCTA: String(t("ctas.services.mobile")),
      aiCTA: String(t("ctas.services.ai")),
      cloudCTA: String(t("ctas.services.cloud"))
    }),
    { title: "", subtitle: "", consultSolution: "", webCTA: "", mobileCTA: "", aiCTA: "", cloudCTA: "" }
  )

  const getServiceIcon = (iconName: string) => {
    const iconClass = "h-10 w-10 text-blue-500 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
    // "Code" y cualquier nombre no mapeado usan Code2 (no Code) — discrepancia
    // ya existente en producción, documentada en lib/service-icon-map.ts.
    const Icon = iconName !== "Code" && iconName in serviceIconMap ? getServiceIconComponent(iconName) : Code2
    return <Icon className={iconClass} />
  }

  // Si no está montado, renderizamos una estructura vacía o con placeholders para evitar mismatch
  if (!isMounted) {
    return (
      <section id="services" className="py-20 bg-black relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 opacity-0">Title</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8 opacity-0">Subtitle</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="services" className="py-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl pointer-events-none -z-10 opacity-30">
        <div className="w-full h-full bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 blur-3xl rounded-full" />
      </div>

      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{translatedTexts.title}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            {translatedTexts.subtitle}
          </p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        </motion.div>

        <div className="relative">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {translatedContent.services.map((service, index) => {
              const parts = service.description.split('|');
              const promise = parts[0]?.trim();
              const benefits = parts.slice(1);

              return (
                <motion.div
                  key={service._id || `service-${index}-${service.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * index }}
                  whileHover={{
                    scale: 1.03,
                    y: -4,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  viewport={{ once: true }}
                  className="h-full relative group"
                >
                  <Card className="bg-zinc-900/40 border border-white/10 backdrop-blur-md hover:border-blue-500/50 transition-colors duration-200 flex flex-col h-full relative z-10 overflow-visible">
                    {/* Glow con opacidad fija animada (compositor) en vez de animar el blur del shadow (repaint) */}
                    <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-200 -z-10 rounded-xl" />
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex flex-col items-center text-center h-full">
                        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 flex-shrink-0 relative">
                          {getServiceIcon(service.icon)}
                          <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                        </div>

                        <div className="min-h-[64px] flex items-center justify-center text-center w-full mb-2">
                          <h3 className="text-xl font-bold text-blue-400">{service.title}</h3>
                        </div>

                        <p className="text-sm font-medium mb-4 text-white/90 italic">"{promise}"</p>

                        <ul className="text-left space-y-2 mb-6 w-full">
                          {benefits.map((benefit, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start">
                              <Check className="text-blue-500 mr-2 h-3 w-3 flex-shrink-0 mt-0.5" />
                              {benefit.trim()}
                            </li>
                          ))}
                        </ul>

                        <Link
                          href="/contact"
                          onClick={() => {
                            try {
                              sessionStorage.setItem("jevy_initial_service", getServiceKey(service.title))
                            } catch {}
                          }}
                          className="mt-auto w-full py-3 px-2 bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-400 text-blue-400 hover:text-white text-[11px] font-black uppercase tracking-wider transition-colors duration-200 rounded flex items-center justify-center group/btn"
                        >
                          {(() => {
                            switch (getServiceKey(service.title)) {
                              case 'automation':
                                return translatedTexts.aiCTA;
                              case 'mobile':
                                return translatedTexts.mobileCTA;
                              case 'infra':
                                return translatedTexts.cloudCTA;
                              default:
                                return translatedTexts.webCTA;
                            }
                          })()}
                          <ArrowRight className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

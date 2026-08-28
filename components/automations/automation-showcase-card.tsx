"use client"

import { LocalizedLink as Link } from "@/components/common/localized-link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FlowDiagram } from "./flow-diagram"
import { flowIconMap } from "./flow-card"

export interface ShowcaseAutomation {
  id: string
  slug: string
  icon: string
  title: string
  description: string
  subtype?: string
  steps: string[]
  demoPlaceholder: string
  demoOutputTemplate: string
}

/**
 * Card grande de automatización activa en el carrusel de /work — resumen + `FlowDiagram` embebido.
 * Recibe: `automation: ShowcaseAutomation` + `direction` (animación entrar/salir) + labels traducidos.
 * Produce: header con ícono/título/subtipo + botón "ver detalle" + `FlowDiagram` interactivo.
 */
interface AutomationShowcaseCardProps {
  automation: ShowcaseAutomation
  direction: number
  tryPrompt: string
  sendLabel: string
  outputLabel: string
  viewDetailLabel: string
}

const variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -60 : 60 }),
}

export function AutomationShowcaseCard({ automation, direction, tryPrompt, sendLabel, outputLabel, viewDetailLabel }: AutomationShowcaseCardProps) {
  const Icon = flowIconMap[automation.icon] || MessageCircle

  return (
    <div className="relative bg-zinc-900/40 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={automation.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-blue-500/10 flex-shrink-0">
              <Icon className="h-7 w-7 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-white">{automation.title}</h3>
                {automation.subtype && (
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-mono px-2 py-1 rounded-full border border-blue-600/30 uppercase font-bold">
                    {automation.subtype}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">{automation.description}</p>
            </div>
            <Button asChild size="sm" className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-500 flex-shrink-0">
              <Link href={`/automations/${automation.slug}?from=work`}>
                {viewDetailLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Button asChild size="sm" className="sm:hidden mb-6 bg-blue-600 hover:bg-blue-500">
            <Link href={`/automations/${automation.slug}?from=work`}>
              {viewDetailLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <FlowDiagram
            flow={{
              icon: automation.icon,
              title: automation.title,
              description: automation.description,
              steps: automation.steps,
              demoPlaceholder: automation.demoPlaceholder,
              demoOutputTemplate: automation.demoOutputTemplate,
            }}
            tryPrompt={tryPrompt}
            sendLabel={sendLabel}
            outputLabel={outputLabel}
            heightClassName="h-[320px] sm:h-[380px]"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

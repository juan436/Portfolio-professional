"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import { fetchProjects } from "@/services/api/projects"
import { fetchTestimonials } from "@/services/api/testimonials"

interface PanelTexts {
  aboutBadge: string
  aboutText: string
  statsHeading: string
  projectsSuffix: string
  ratingSuffix: string
  stepsHeading: string
  step1: string
  step2: string
  step3: string
  step4: string
  fallbackHeading: string
  fallbackText: string
}

function usePanelTexts(): PanelTexts {
  const { t } = useLanguage()
  const [texts, setTexts] = useState<PanelTexts>({
    aboutBadge: "",
    aboutText: "",
    statsHeading: "",
    projectsSuffix: "",
    ratingSuffix: "",
    stepsHeading: "",
    step1: "",
    step2: "",
    step3: "",
    step4: "",
    fallbackHeading: "",
    fallbackText: "",
  })

  useEffect(() => {
    setTexts({
      aboutBadge: String(t("contact.jevy.about.badge")),
      aboutText: String(t("contact.jevy.about.text")),
      statsHeading: String(t("contact.jevy.stats.heading")),
      projectsSuffix: String(t("contact.jevy.stats.projectsSuffix")),
      ratingSuffix: String(t("contact.jevy.stats.ratingSuffix")),
      stepsHeading: String(t("contact.jevy.steps.heading")),
      step1: String(t("contact.jevy.steps.step1")),
      step2: String(t("contact.jevy.steps.step2")),
      step3: String(t("contact.jevy.steps.step3")),
      step4: String(t("contact.jevy.steps.step4")),
      fallbackHeading: String(t("contact.jevy.fallback.heading")),
      fallbackText: String(t("contact.jevy.fallback.text")),
    })
  }, [t])

  return texts
}

function useRealStats() {
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [testimonialCount, setTestimonialCount] = useState<number | null>(null)

  useEffect(() => {
    fetchProjects().then((projects: { category: string }[]) => {
      const delivered = projects.filter((p) => p.category !== "laboratory")
      setProjectCount(delivered.length)
    })
    fetchTestimonials().then((testimonials) => {
      const rated = testimonials.filter((t) => typeof t.rating === "number")
      if (rated.length > 0) {
        setAvgRating(rated.reduce((sum, t) => sum + (t.rating || 0), 0) / rated.length)
      }
      setTestimonialCount(testimonials.length)
    })
  }, [])

  return { projectCount, avgRating, testimonialCount }
}

export function JevyAboutPanel() {
  const texts = usePanelTexts()
  const { projectCount, avgRating, testimonialCount } = useRealStats()

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-blue-700/15 bg-black/30 p-4 text-sm leading-relaxed">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_theme(colors.green.500)]" />
          <span className="font-mono text-[0.7rem] uppercase tracking-wider text-blue-400">{texts.aboutBadge}</span>
        </div>
        <p className="text-slate-400">{texts.aboutText}</p>
      </div>

      {(projectCount !== null || avgRating !== null) && (
        <div className="rounded-lg border border-blue-700/15 bg-black/30 p-4 font-mono">
          <div className="text-[0.7rem] uppercase tracking-wider text-blue-400 mb-3">{texts.statsHeading}</div>
          <div className="flex flex-col gap-2">
            {projectCount !== null && (
              <div className="flex items-baseline justify-between">
                <span className="text-blue-400 font-extrabold text-lg">{projectCount}</span>
                <span className="text-slate-500 text-[0.7rem] uppercase tracking-wide">{texts.projectsSuffix}</span>
              </div>
            )}
            {avgRating !== null && (
              <div className="flex items-baseline justify-between">
                <span className="text-blue-400 font-extrabold text-lg">{avgRating.toFixed(1)}★</span>
                <span className="text-slate-500 text-[0.7rem] uppercase tracking-wide">
                  {testimonialCount ? `${testimonialCount} ${texts.ratingSuffix}` : texts.ratingSuffix}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function JevyGuidePanel() {
  const texts = usePanelTexts()
  const { content } = useContent()
  const email = content?.contact?.email

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-blue-700/15 bg-black/30 p-4">
        <div className="font-mono text-[0.7rem] uppercase tracking-wider text-blue-400 mb-3">{texts.stepsHeading}</div>
        <ol className="flex flex-col gap-3">
          {[texts.step1, texts.step2, texts.step3, texts.step4].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border border-blue-700/30 bg-blue-500/10 text-blue-400 font-mono text-[0.65rem] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {email && (
        <div className="rounded-lg border border-blue-700/15 bg-black/30 p-4 text-sm">
          <div className="font-mono text-[0.7rem] uppercase tracking-wider text-blue-400 mb-2">{texts.fallbackHeading}</div>
          <p className="text-slate-400 mb-2">{texts.fallbackText}</p>
          <a href={`mailto:${email}`} className="font-mono text-[0.85rem] text-blue-300 border-b border-dashed border-blue-700/40 hover:text-blue-200 transition-colors">
            {email}
          </a>
        </div>
      )}
    </div>
  )
}

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Activity, ArrowLeft, BarChart3, Briefcase, Clock, ExternalLink, Github, Layers, Lightbulb, MessageCircle, Quote, Repeat, Server, Settings2, ShieldCheck, ShoppingCart, Smartphone, Star, TrendingUp, User, Workflow, Wrench } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import type { RawTestimonial } from "@/services/api/testimonials"
import type { ProjectMetric } from "@/services/api/project-stats"
import { ProjectHeader } from "@/components/projects/project-header"
import { ProjectImageCarousel } from "@/components/projects/project-image-carousel"
import { DeploymentDiagram, type DeploymentIconKey } from "@/components/projects/deployment-diagram"
import { TestimonialMetrics } from "@/components/projects/testimonial-metrics"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

/**
 * Vista de detalle de un proyecto web/mobile/infra_backend (`/projects/[slug]`).
 * Recibe: `project` (crudo, con traducciones) + `testimonials`/`resultsMetrics`.
 * Produce: galería de imágenes, reto/solución, cómo lo trabajé, decisiones técnicas, seguridad,
 * detalles específicos por tipo (infra/sistema/ecommerce/mobile), diagrama de despliegue, métricas y testimonios.
 */
interface RawProject {
  _id: string
  title: string
  description: string
  image?: string
  images?: string[]
  github?: string
  demo?: string
  tags?: string[]
  duration?: string
  sector?: string
  subtype?: string
  role?: string
  workProcess?: { kind: 'paragraph' | 'steps'; text?: string; items?: string[] }[]
  techStack?: {
    frontend?: string[]
    backend?: string[]
    database?: string[]
    infra?: string[]
  }
  challenge?: { problem: string; solution: string }
  technicalDecisions?: { title: string; description: string }[]
  securityHardening?: string[]
  deploymentDiagram?: { icon: string; label: string }[]
  infraDetails?: { uptime?: string; capacity?: string; monitoring?: string[]; backupStrategy?: string; costOptimized?: string }
  systemDetails?: { timeSaved?: string; usersManaged?: string; capacity?: string; integrations?: string[]; reportsGenerated?: string }
  ecommerceDetails?: { paymentGateway?: string[]; checkoutFlow?: string; inventory?: string; capacity?: string; performanceSeo?: string; paymentMethods?: string[] }
  mobileDetails?: { platforms?: string[]; storeStatus?: string; offlineSupport?: string; pushNotifications?: string; loadPerformance?: string }
  translations?: {
    en?: { title?: string; description?: string }
    fr?: { title?: string; description?: string }
    it?: { title?: string; description?: string }
  }
}

interface ProjectDetailViewProps {
  project: RawProject | null
  testimonials: RawTestimonial[]
  resultsMetrics: ProjectMetric[]
}

export function ProjectDetailView({ project, testimonials, resultsMetrics }: ProjectDetailViewProps) {
  const { language, t } = useLanguage()

  const backLabel = String(t("projects.backToHome") || "Volver")
  const testimonialHeading = String(t("projects.testimonialHeading") || "Testimonio")
  const resultsHeading = String(t("projects.resultsHeading") || "Métricas y Resultados")
  const codeLabel = String(t("projects.code") || "Código")
  const demoLabel = String(t("projects.demo") || "Demo")
  const techStackHeading = String(t("projects.techStackHeading") || "Stack Técnico")
  const challengeHeading = String(t("projects.challengeHeading") || "El Reto")
  const solutionHeading = String(t("projects.solutionHeading") || "La Solución")
  const decisionsHeading = String(t("projects.decisionsHeading") || "Decisiones Técnicas")
  const securityHeading = String(t("projects.securityHeading") || "Qué protege en producción")
  const deploymentHeading = String(t("projects.deploymentHeading") || "Cómo está desplegado")
  const infraDetailsHeading = String(t("projects.infraDetailsHeading") || "Infraestructura en producción")
  const systemDetailsHeading = String(t("projects.systemDetailsHeading") || "Impacto en el negocio")
  const ecommerceDetailsHeading = String(t("projects.ecommerceDetailsHeading") || "Comercio electrónico")
  const mobileDetailsHeading = String(t("projects.mobileDetailsHeading") || "Detalles de la app")
  const ctaHeading = String(t("projects.ctaHeading") || "¿Necesitas algo similar?")
  const ctaText = String(t("projects.ctaText") || "Hablemos sobre tu proyecto.")
  const ctaButton = String(t("projects.ctaButton") || "Hablemos")
  const durationQuestionLabel = String(t("projects.durationQuestionLabel") || "Tiempo de desarrollo")
  const sectorQuestionLabel = String(t("projects.sectorQuestionLabel") || "Enfocado a")
  const roleHeading = String(t("projects.roleHeading") || "Rol en el proyecto")
  const workProcessHeading = String(t("projects.workProcessHeading") || "Cómo trabajé")
  const techStackCategoryLabels: Record<string, string> = {
    frontend: String(t("projects.techStackFrontend") || "Frontend"),
    backend: String(t("projects.techStackBackend") || "Backend"),
    database: String(t("projects.techStackDatabase") || "Base de Datos"),
    infra: String(t("projects.techStackInfra") || "Infraestructura"),
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  if (!project) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-400 mb-6">{String(t("projects.noProjects") || "")}</p>
        <Link href="/work" className="text-blue-500 hover:text-blue-400 inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </main>
    )
  }

  const translated = project.translations?.[language.code as "en" | "fr" | "it"]
  const title = language.code === "es" ? project.title : translated?.title || project.title
  const description = language.code === "es" ? project.description : translated?.description || project.description
  const galleryImages = project.images && project.images.length > 0 ? project.images : project.image ? [project.image] : []
  const hasGallery = galleryImages.length > 0
  const backendBannerLabel = String(t("projects.backendBanner") || "Infraestructura & Backend")
  const techStackEntries = Object.entries(project.techStack || {}).filter(
    ([, items]) => Array.isArray(items) && items.length > 0
  ) as [string, string[]][]

  const infraRows = [
    project.infraDetails?.uptime,
    project.infraDetails?.capacity,
    project.infraDetails?.monitoring?.length ? project.infraDetails.monitoring.join(', ') : undefined,
    project.infraDetails?.backupStrategy,
    project.infraDetails?.costOptimized,
  ].filter(Boolean) as string[]

  const systemRows = [
    project.systemDetails?.timeSaved,
    project.systemDetails?.usersManaged,
    project.systemDetails?.capacity,
    project.systemDetails?.integrations?.length ? project.systemDetails.integrations.join(', ') : undefined,
    project.systemDetails?.reportsGenerated,
  ].filter(Boolean) as string[]

  const ecommerceRows = [
    project.ecommerceDetails?.paymentGateway?.length ? project.ecommerceDetails.paymentGateway.join(', ') : undefined,
    project.ecommerceDetails?.checkoutFlow,
    project.ecommerceDetails?.inventory,
    project.ecommerceDetails?.capacity,
    project.ecommerceDetails?.performanceSeo,
    project.ecommerceDetails?.paymentMethods?.length ? project.ecommerceDetails.paymentMethods.join(', ') : undefined,
  ].filter(Boolean) as string[]

  const mobileRows = [
    project.mobileDetails?.platforms?.length ? project.mobileDetails.platforms.join(', ') : undefined,
    project.mobileDetails?.storeStatus,
    project.mobileDetails?.offlineSupport,
    project.mobileDetails?.pushNotifications,
    project.mobileDetails?.loadPerformance,
  ].filter(Boolean) as string[]

  return (
    <main className="min-h-screen bg-black">
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10 max-w-6xl">
          <ProjectHeader
            title={title}
            description={description}
            subtype={project.subtype}
            hideHeader
            nav={{ backHref: "/work" }}
          />

          {hasGallery ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <ProjectImageCarousel images={galleryImages} alt={title} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-14 rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/60 to-zinc-900/20 py-12 flex flex-col items-center justify-center gap-3"
            >
              <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Server className="h-10 w-10 text-blue-500" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400 font-bold">{backendBannerLabel}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-4">
            {/* Columna principal: reto, solución y decisiones técnicas */}
            <div className="lg:col-span-2 space-y-12">
              {project.challenge && (project.challenge.problem || project.challenge.solution) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      {challengeHeading}
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-sm">{project.challenge.problem}</p>
                  </div>
                  <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-3 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      {solutionHeading}
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-sm">{project.challenge.solution}</p>
                  </div>
                </motion.div>
              )}

              {(project.duration || project.sector || project.role) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex flex-wrap items-stretch gap-4"
                >
                  {project.duration && (
                    <div className="min-w-[180px] max-w-[220px] text-left p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        {durationQuestionLabel}
                      </p>
                      <p className="text-sm font-bold text-white break-words">{project.duration}</p>
                    </div>
                  )}
                  {project.sector && (
                    <div className="min-w-[180px] max-w-[220px] text-left p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                        {sectorQuestionLabel}
                      </p>
                      <p className="text-sm font-bold text-white break-words">{project.sector}</p>
                    </div>
                  )}
                  {project.role && (
                    <div className="min-w-[220px] flex-1 text-left p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                        <User className="h-3.5 w-3.5 text-blue-500" />
                        {roleHeading}
                      </p>
                      <p className="text-sm font-bold text-white">{project.role}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {project.workProcess && project.workProcess.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-xl bg-zinc-900/40 border border-white/5"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-6 flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    {workProcessHeading}
                  </h3>
                  <div className="space-y-6">
                    {project.workProcess.map((block, bi) =>
                      block.kind === 'paragraph' ? (
                        block.text && (
                          <p key={bi} className="text-sm text-slate-300 leading-relaxed">
                            {block.text}
                          </p>
                        )
                      ) : (
                        block.items && block.items.length > 0 && (
                          <div key={bi} className="space-y-6">
                            {block.items.map((step, i) => (
                              <div key={i} className="relative pl-11">
                                {i < block.items!.length - 1 && (
                                  <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-blue-500/20" />
                                )}
                                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-300">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed pt-1.5">{step}</p>
                              </div>
                            ))}
                          </div>
                        )
                      )
                    )}
                  </div>
                </motion.div>
              )}

              {project.technicalDecisions && project.technicalDecisions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-blue-500" />
                    {decisionsHeading}
                  </h2>
                  <div className="space-y-4">
                    {project.technicalDecisions.map((decision, i) => (
                      <div key={i} className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                        <h3 className="text-base font-bold text-white mb-2">{decision.title}</h3>
                        <p className="text-slate-300 leading-relaxed text-sm">{decision.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>

            {/* Sidebar: acciones + stack técnico clasificado */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-28 space-y-6">
                {(project.demo || project.github) && (
                  <div className="flex flex-col gap-3">
                    {project.demo && (
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 justify-center">
                        <a href={project.demo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {demoLabel}
                        </a>
                      </Button>
                    )}
                    {project.github && (
                      <Button asChild variant="outline" size="sm" className="border-blue-700/50 text-blue-500 hover:bg-blue-700/10 justify-center">
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" />
                          {codeLabel}
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {techStackEntries.length > 0 && (
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-white">
                      <Layers className="h-4 w-4 text-blue-500" />
                      {techStackHeading}
                    </h2>
                    <div className="space-y-4">
                      {techStackEntries.map(([category, items]) => (
                        <div key={category}>
                          <p className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-2">
                            {techStackCategoryLabels[category] || category}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => (
                              <span
                                key={item}
                                className="bg-white/5 border border-white/10 text-slate-300 text-xs px-2 py-1 rounded"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.securityHardening && project.securityHardening.length > 0 && (
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-white">
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                      {securityHeading}
                    </h2>
                    <ul className="space-y-2">
                      {project.securityHardening.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {infraRows.length > 0 && (
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-white">
                      <Activity className="h-4 w-4 text-blue-500" />
                      {infraDetailsHeading}
                    </h2>
                    <ul className="space-y-2">
                      {infraRows.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <Activity className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {systemRows.length > 0 && (
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-white">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      {systemDetailsHeading}
                    </h2>
                    <ul className="space-y-2">
                      {systemRows.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <BarChart3 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {ecommerceRows.length > 0 && (
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-white">
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                      {ecommerceDetailsHeading}
                    </h2>
                    <ul className="space-y-2">
                      {ecommerceRows.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <ShoppingCart className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {mobileRows.length > 0 && (
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/5">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-white">
                      <Smartphone className="h-4 w-4 text-blue-500" />
                      {mobileDetailsHeading}
                    </h2>
                    <ul className="space-y-2">
                      {mobileRows.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <Smartphone className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {project.deploymentDiagram && project.deploymentDiagram.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Workflow className="h-5 w-5 text-blue-500" />
                {deploymentHeading}
              </h2>
              <DeploymentDiagram
                steps={project.deploymentDiagram.map((step) => ({
                  icon: step.icon as DeploymentIconKey,
                  label: step.label,
                }))}
              />
            </motion.div>
          )}

          {resultsMetrics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <h2 className="text-xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                {resultsHeading}
              </h2>
              <div className="max-w-6xl mx-auto px-6 sm:px-10">
                <TestimonialMetrics metrics={resultsMetrics} />
              </div>
            </motion.div>
          )}

          {testimonials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <h2 className="text-xl font-bold text-center mb-8">{testimonialHeading}</h2>
              <div className={`grid grid-cols-1 ${testimonials.length > 1 ? "md:grid-cols-2" : ""} gap-6 max-w-4xl mx-auto`}>
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial._id}
                    className="p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < (testimonial.rating || 5)
                              ? "fill-blue-500 text-blue-500"
                              : "text-white/10"
                          }
                        />
                      ))}
                    </div>
                    <div className="relative mb-6">
                      <Quote className="absolute -top-3 -left-3 w-8 h-8 text-blue-500/10 z-0" />
                      <p className="text-slate-300 text-base leading-relaxed relative z-10 italic">
                        "{testimonial.content}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-blue-600/20">
                        <AvatarFallback className="bg-blue-600/20 text-blue-400 font-bold">
                          {getInitials(testimonial.author)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-white font-bold leading-tight">{testimonial.author}</span>
                        <span className="text-blue-400 text-sm">{testimonial.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 rounded-xl border border-blue-500/20 bg-blue-500/5 p-8 text-center"
          >
            <h2 className="text-xl font-bold mb-2">{ctaHeading}</h2>
            <p className="text-slate-400 mb-6">{ctaText}</p>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500">
              <Link href="/#contact">
                <MessageCircle className="mr-2 h-4 w-4" />
                {ctaButton}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

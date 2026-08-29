"use client"

import { techStackEntries } from "@/lib/utils"
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Compass,
  ExternalLink,
  FlaskConical,
  Github,
  GitCompare,
  Layers,
  Lightbulb,
  ShieldAlert,
  Target,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { ProjectHeader } from "@/components/projects/project-header"
import { DeploymentDiagram, type DeploymentIconKey } from "@/components/projects/deployment-diagram"
import { FlowDiagram } from "@/components/automations/flow-diagram"
import { Button } from "@/components/ui/button"
import { DetailPageShell, DetailNotFound } from "@/components/common/detail-page-shell"
import { FadeIn } from "@/components/common/fade-in"
import { WorkBlocks, type WorkBlock } from "@/components/projects/work-blocks"
import { TechStackCard, SidebarListCard } from "@/components/projects/tech-stack-card"

interface RawLabProject {
  _id: string
  title: string
  description: string
  image?: string
  video?: string
  github?: string
  demo?: string
  tags?: string[]
  sector?: string
  techStack?: {
    frontend?: string[]
    backend?: string[]
    database?: string[]
    infra?: string[]
  }
  deploymentDiagram?: { icon: string; label: string }[]
  labDetails?: {
    status?: "testing" | "completed" | "discontinued" | "evolved"
    testing?: WorkBlock[]
    learnings?: WorkBlock[]
    motivation?: string
    limitations?: string[]
    nextStep?: string
    comparison?: string
    timeInvested?: string
    flow?: {
      steps?: string[]
      demoPlaceholder?: string
      demoOutputTemplate?: string
    }
  }
  translations?: {
    en?: { title?: string; description?: string }
    fr?: { title?: string; description?: string }
    it?: { title?: string; description?: string }
  }
}

const STATUS_STYLES: Record<string, string> = {
  testing: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  discontinued: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  evolved: "bg-purple-500/10 text-purple-400 border-purple-500/30",
}

/**
 * Vista de detalle de un proyecto de Laboratorio (`/laboratory/[slug]`).
 * Recibe: `project` (crudo, con traducciones) o `null` si no existe.
 * Produce: estado/motivación/qué prueba/qué aprendió/comparación/limitaciones/próximo paso,
 * más stack técnico, diagrama de despliegue y `FlowDiagram` si el proyecto los tiene.
 */
interface LaboratoryDetailViewProps {
  project: RawLabProject | null
}

export function LaboratoryDetailView({ project }: LaboratoryDetailViewProps) {
  const { language, t } = useLanguage()

  const backLabel = String(t("projects.backToHome") || "Volver")
  const codeLabel = String(t("projects.code") || "Código")
  const demoLabel = String(t("projects.demo") || "Demo")
  const noProjectsLabel = String(t("projects.noProjects") || "")
  const sectorLabel = String(t("projects.sectorQuestionLabel") || "Enfocado a")
  const techStackHeading = String(t("projects.techStackHeading") || "Stack Técnico")
  const techStackCategoryLabels: Record<string, string> = {
    frontend: String(t("projects.techStackFrontend") || "Frontend"),
    backend: String(t("projects.techStackBackend") || "Backend"),
    database: String(t("projects.techStackDatabase") || "Base de Datos"),
    infra: String(t("projects.techStackInfra") || "Infraestructura"),
  }
  const statusHeading = String(t("laboratory.detail.statusHeading") || "Estado")
  const statusLabels: Record<string, string> = {
    testing: String(t("laboratory.detail.statusTesting") || "En pruebas"),
    completed: String(t("laboratory.detail.statusCompleted") || "Completado"),
    discontinued: String(t("laboratory.detail.statusDiscontinued") || "Descontinuado"),
    evolved: String(t("laboratory.detail.statusEvolved") || "Evolucionó a proyecto real"),
  }
  const timeInvestedLabel = String(t("laboratory.detail.timeInvestedLabel") || "Tiempo invertido")
  const motivationHeading = String(t("laboratory.detail.motivationHeading") || "Por qué lo exploré")
  const testingHeading = String(t("laboratory.detail.testingHeading") || "Qué estoy probando")
  const learningsHeading = String(t("laboratory.detail.learningsHeading") || "Qué aprendí")
  const comparisonHeading = String(t("laboratory.detail.comparisonHeading") || "Comparado con otras opciones")
  const limitationsHeading = String(t("laboratory.detail.limitationsHeading") || "Limitaciones conocidas")
  const nextStepHeading = String(t("laboratory.detail.nextStepHeading") || "Próximo paso")
  const deploymentHeading = String(t("projects.deploymentHeading") || "Cómo está desplegado")
  const flowHeading = String(t("automations.detail.stepsHeading") || "Cómo funciona, paso a paso")
  const tryPromptLabel = String(t("automations.tryPrompt") || "Probá con tu propio mensaje:")
  const sendLabel = String(t("automations.sendLabel") || "Enviar")
  const outputLabel = String(t("automations.outputLabel") || "Resultado")

  if (!project) {
    return <DetailNotFound message={noProjectsLabel} backHref="/laboratory" backLabel={backLabel} />
  }

  const translated = project.translations?.[language.code as "en" | "fr" | "it"]
  const title = language.code === "es" ? project.title : translated?.title || project.title
  const description = language.code === "es" ? project.description : translated?.description || project.description
  const imageUrl = project.image || "/placeholder.svg?height=400&width=600"
  const labDetails = project.labDetails
  const stackEntries = techStackEntries(project.techStack)

  return (
    <DetailPageShell maxWidthClass="max-w-6xl">
          <ProjectHeader title={title} description={description} hideHeader nav={{ backHref: "/laboratory" }} />

          {labDetails?.status && (
            <div className="flex justify-center -mt-10 mb-10">
              <span
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border rounded-full px-4 py-1.5 ${STATUS_STYLES[labDetails.status]}`}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                {statusHeading}: {statusLabels[labDetails.status]}
              </span>
            </div>
          )}

          <FadeIn className="relative aspect-video rounded-xl overflow-hidden border border-white/10 mb-8 bg-black">
            {project.video ? (
              <video src={project.video} controls autoPlay className="w-full h-full object-contain" />
            ) : (
              <img src={imageUrl} alt={title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            )}
          </FadeIn>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div className="flex flex-wrap gap-2">
              {project.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              {project.github && (
                <Button asChild variant="outline" size="sm" className="border-blue-700/50 text-blue-500 hover:bg-blue-700/10">
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    {codeLabel}
                  </a>
                </Button>
              )}
              {project.demo && (
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500">
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {demoLabel}
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-12">
              {(project.sector || labDetails?.timeInvested) && (
                <div className="flex flex-wrap items-stretch gap-4">
                  {project.sector && (
                    <div className="min-w-[180px] max-w-[220px] text-left p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                        {sectorLabel}
                      </p>
                      <p className="text-sm font-bold text-white break-words">{project.sector}</p>
                    </div>
                  )}
                  {labDetails?.timeInvested && (
                    <div className="min-w-[180px] max-w-[220px] text-left p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        {timeInvestedLabel}
                      </p>
                      <p className="text-sm font-bold text-white break-words">{labDetails.timeInvested}</p>
                    </div>
                  )}
                </div>
              )}

              {labDetails?.motivation && (
                <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-3 flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    {motivationHeading}
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{labDetails.motivation}</p>
                </div>
              )}

              {labDetails?.testing && labDetails.testing.length > 0 && (
                <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-6 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {testingHeading}
                  </h3>
                  <WorkBlocks blocks={labDetails.testing} />
                </div>
              )}

              {labDetails?.learnings && labDetails.learnings.length > 0 && (
                <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-6 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    {learningsHeading}
                  </h3>
                  <WorkBlocks blocks={labDetails.learnings} />
                </div>
              )}

              {labDetails?.comparison && (
                <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-3 flex items-center gap-2">
                    <GitCompare className="h-4 w-4" />
                    {comparisonHeading}
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{labDetails.comparison}</p>
                </div>
              )}

              {labDetails?.nextStep && (
                <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-3 flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                    {nextStepHeading}
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{labDetails.nextStep}</p>
                </div>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-28 space-y-6">
                <TechStackCard
                  entries={stackEntries}
                  categoryLabels={techStackCategoryLabels}
                  heading={techStackHeading}
                />

                <SidebarListCard
                  icon={ShieldAlert}
                  heading={limitationsHeading}
                  items={labDetails?.limitations ?? []}
                  itemIcon={ShieldAlert}
                />
              </div>
            </aside>
          </div>

          {project.deploymentDiagram && project.deploymentDiagram.length > 1 && (
            <FadeIn className="mt-16">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                {deploymentHeading}
              </h2>
              <DeploymentDiagram
                steps={project.deploymentDiagram.map((step) => ({
                  icon: step.icon as DeploymentIconKey,
                  label: step.label,
                }))}
              />
            </FadeIn>
          )}

          {labDetails?.flow?.steps && labDetails.flow.steps.length > 0 && (
            <FadeIn className="mt-16">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                {flowHeading}
              </h2>
              <FlowDiagram
                flow={{
                  icon: "",
                  title,
                  description,
                  steps: labDetails.flow.steps,
                  demoPlaceholder: labDetails.flow.demoPlaceholder || "",
                  demoOutputTemplate: labDetails.flow.demoOutputTemplate || "{input}",
                }}
                tryPrompt={tryPromptLabel}
                sendLabel={sendLabel}
                outputLabel={outputLabel}
              />
            </FadeIn>
          )}
    </DetailPageShell>
  )
}

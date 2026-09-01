import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"
import TestimonialForm from "@/components/testimonial-form"

// Usa searchParams (?tag / ?project) -> dinámica, no ISR.
export const dynamic = "force-dynamic"

// Página no listada en el sitemap/nav a propósito — se comparte el link
// directo con el cliente después de cerrar un proyecto (no tiene sentido
// dejarla descubrible desde el menú público), de ahí el `robots: noindex`.
export const metadata: Metadata = {
  ...buildMetadata({
    title: "Dejar un testimonio",
    description: "Contá tu experiencia trabajando con Juan Villegas en tu proyecto o automatización.",
    path: "/testimonial",
  }),
  robots: { index: false, follow: false },
}

/** Página `/testimonial` (Server Component) — wrapper mínimo del wizard público de 2 steps. */
export default async function TestimonialPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const { project } = await searchParams

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="flex-grow">
        <TestimonialForm initialProjectSlug={project} />
      </div>
    </main>
  )
}

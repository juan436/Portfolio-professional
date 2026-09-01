import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"
import TestimonialForm from "@/components/testimonial-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Dejar un testimonio",
    description: "Contá tu experiencia trabajando con Juan Villegas en tu proyecto o automatización.",
    path: "/testimonial",
  }),
  robots: { index: false, follow: false },
}

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

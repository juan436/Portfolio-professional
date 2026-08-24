import type { Metadata } from "next"
import { getContactInfo } from "@/lib/data/home-content"
import { ContentHydrator } from "@/components/content-hydrator"
import Contact from "@/components/contact"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "Hablemos",
  description: "Contactá a Juan Villegas para tu próximo proyecto de desarrollo, automatización o integración de IA.",
  path: "/contact",
})

/** Página `/contact` (Server Component). Recibe: nada. Produce: hidrata solo `content.contact` + el chat de Jevy. */
export default async function ContactPage() {
  const contact = await getContactInfo()

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {contact && <ContentHydrator partial={{ contact }} />}
      <div className="flex-grow">
        <Contact />
      </div>
    </main>
  )
}

import { getContactInfo } from "@/lib/data/home-content"
import { ContentHydrator } from "@/components/content-hydrator"
import Contact from "@/components/contact"

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

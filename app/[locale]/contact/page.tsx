import type { Metadata } from "next"
import { getServerT } from "@/lib/i18n/server-dict"
import { getContactInfo } from "@/lib/data/home-content"
import { ContentHydrator } from "@/components/content-hydrator"
import Contact from "@/components/contact"
import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = getServerT(locale)
  return buildMetadata({
    title: t("seo.contact.title"),
    description: t("seo.contact.description"),
    path: "/contact",
    locale,
  })
}

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

import type { Metadata } from "next"
import { getServerT } from "@/lib/i18n/server-dict"
import Contact from "@/components/contact"
import { buildMetadata } from "@/lib/seo/metadata"
import { siteOgImage } from "@/lib/site-config"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = getServerT(locale)
  return buildMetadata({
    title: t("seo.contact.title"),
    description: t("seo.contact.description"),
    path: "/contact",
    locale,
    image: siteOgImage(locale),
  })
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="flex-grow">
        <Contact />
      </div>
    </main>
  )
}

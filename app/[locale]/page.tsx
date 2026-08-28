import type { Metadata } from "next"
import { getHomeContent } from "@/lib/data/home-content"
import { buildMetadata } from "@/lib/seo/metadata"
import { ContentHydrator } from "@/components/content-hydrator"
import { ProfilePageJsonLd } from "@/components/seo/profile-page-json-ld"
import Hero from "@/components/hero"
import MetricsSection from "@/components/metrics"
import Services from "@/components/services"
import Methodology from "@/components/methodology"
import About from "@/components/about"
import Experience from "@/components/experience"
import Skills from "@/components/skills"
import Testimonials from "@/components/testimonials"
import WelcomeAnimation from "@/components/welcome-animation"

/**
 * Home (Server Component) — trae todo el contenido server-side para hidratar el Context antes del primer paint.
 * Recibe: nada.
 * Produce: `ContentHydrator` (hidrata `ContentProvider` sin los 7 fetches client-side) + las secciones del home.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  // El title/description de la home los pone el layout raíz; acá solo se fija
  // el canonical de esta versión de idioma + el hreflang a las 4.
  const m = buildMetadata({ title: "", description: "", path: "/", locale })
  return { alternates: m.alternates, openGraph: { url: m.openGraph?.url, locale: (m.openGraph as { locale?: string })?.locale } }
}

export default async function Home() {
  const homeContent = await getHomeContent()

  return (
    <main className="min-h-screen">
      <ProfilePageJsonLd />
      <ContentHydrator full={homeContent} />
      <WelcomeAnimation />
      <Hero />
      <Services />
      <Methodology />
      <MetricsSection />
      <About />
      <Experience />
      <Skills />
      <Testimonials />
    </main>
  )
}

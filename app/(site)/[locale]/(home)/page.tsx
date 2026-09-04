import type { Metadata } from "next"
import { getApprovedTestimonials } from "@/lib/data/home-content"
import { buildMetadata } from "@/lib/seo/metadata"
import { siteOgImage } from "@/lib/site-config"
import { getServerT } from "@/lib/i18n/server-dict"
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
 * Home (Server Component). El contenido lo hidrata `app/[locale]/layout.tsx`;
 * acá solo se traen los testimonios aprobados (dato exclusivo del home).
 * Recibe: nada.
 * Produce: las secciones del home.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = getServerT(locale)
  return buildMetadata({
    title: t("seo.home.title"),
    description: t("seo.home.description"),
    path: "/",
    locale,
    titleAbsolute: true,
    image: siteOgImage(locale),
  })
}

export default async function Home() {
  const testimonials = await getApprovedTestimonials()

  return (
    <main className="min-h-screen">
      <ProfilePageJsonLd />
      <WelcomeAnimation />
      <Hero hasTestimonials={testimonials.length > 0} />
      <Services />
      <Methodology />
      <MetricsSection />
      <About />
      <Experience />
      <Skills />
      <Testimonials items={testimonials} />
    </main>
  )
}

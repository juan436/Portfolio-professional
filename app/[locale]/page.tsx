import { getHomeContent } from "@/lib/data/home-content"
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

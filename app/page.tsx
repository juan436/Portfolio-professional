import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import MetricsSection from "@/components/metrics"
import Services from "@/components/services"
import Methodology from "@/components/methodology"
import Projects from "@/components/projects"
import Laboratory from "@/components/laboratory"
import Automations from "@/components/automations"
import About from "@/components/about"
import Experience from "@/components/experience"
import Skills from "@/components/skills"
import Testimonials from "@/components/testimonials"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import WelcomeAnimation from "@/components/welcome-animation"

export default function Home() {
  return (
    <main className="min-h-screen">
      <WelcomeAnimation />
      <Navbar />
      <Hero />
      <Services />
      <Methodology />
      <MetricsSection />
      <Projects />
      <Laboratory />
      <Automations />
      <About />
      <Experience />
      <Skills />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  )
}

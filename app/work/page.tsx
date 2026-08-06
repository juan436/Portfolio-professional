import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WorkIntro from "@/components/work"
import Projects from "@/components/projects"
import Automations from "@/components/automations"

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <div className="pt-20 flex-grow">
        <WorkIntro />
        <Projects />
        <Automations />
      </div>

      <Footer />
    </main>
  )
}

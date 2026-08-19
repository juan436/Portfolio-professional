import WorkIntro from "@/components/work"
import Projects from "@/components/projects"
import Automations from "@/components/automations"
import Agents from "@/components/agents"

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="pt-28 flex-grow">
        <WorkIntro />
        <Projects />
        <Automations />
        <Agents />
      </div>
    </main>
  )
}

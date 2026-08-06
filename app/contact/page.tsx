import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Contact from "@/components/contact"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <div className="mt-16 flex-grow">
        <Contact />
      </div>

      <Footer />
    </main>
  )
}

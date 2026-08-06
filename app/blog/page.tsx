"use client"

import Link from "next/link"
import { ArrowLeft, Newspaper } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useLanguage } from "@/hooks/use-language"

export default function BlogPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <div className="flex-grow flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
          <Newspaper className="h-10 w-10 text-blue-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{String(t("blog.title") || "Blog")}</h1>
        <p className="text-slate-400 max-w-md mb-8">{String(t("blog.comingSoon") || "Próximamente")}</p>
        <Link href="/" className="text-blue-500 hover:text-blue-400 inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {String(t("projects.backToHome") || "Volver")}
        </Link>
      </div>

      <Footer />
    </main>
  )
}

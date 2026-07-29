"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface LabProject {
  _id: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
  category: string;
  tags: string[];
  github?: string;
  demo?: string;
  translations?: any;
}

export default function Laboratory() {
  const { language } = useLanguage()
  const [labProjects, setLabProjects] = useState<LabProject[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    
    const fetchLabProjects = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/projects?category=laboratory')
        const result = await response.json()
        
        if (result.success && Array.isArray(result.data)) {
          setLabProjects(result.data)
        }
      } catch (error) {
        console.error('Error fetching lab projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLabProjects()
  }, [])

  if (!isMounted) return null;

  return (
    <section id="laboratory" className="py-24 bg-gradient-to-b from-black to-zinc-950 relative overflow-hidden">
      {/* Fondo de neones decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Laboratorio R&D</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Espacio de experimentación técnica donde desarrollo prototipos, arquitecturas emergentes y soluciones de IA.
          </p>
          <div className="w-20 h-1 bg-blue-600 mb-8 mx-auto" />
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : labProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {labProjects.map((proj, index) => (
              <Dialog key={proj._id || index}>
                <DialogTrigger asChild>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-blue-600/50 transition-all backdrop-blur-sm cursor-pointer"
                  >
                    {/* Video o Imagen con Capas */}
                    <div className="aspect-video bg-black relative overflow-hidden">
                      {/* Capa 1: Imagen de Respaldo (Siempre visible) */}
                      <img 
                        src={proj.image || "/placeholder.svg"} 
                        className="absolute inset-0 w-full h-full object-cover opacity-40 saturate-[0.8]" 
                        alt={proj.title}
                      />
                      
                      {/* Capa 2: Video (Se carga encima) */}
                      {proj.video && (
                        <video 
                          src={proj.video} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                          onCanPlay={(e) => (e.currentTarget.style.opacity = "0.7")}
                        />
                      )}

                      <div className="absolute top-4 right-4 bg-blue-600/20 text-blue-400 text-[10px] font-mono px-2 py-1 rounded-full border border-blue-600/30 backdrop-blur-md z-20">
                        R&D EXPERIMENT
                      </div>
                      <div className="absolute bottom-4 left-4 z-20">
                        <Badge variant="outline" className="bg-black/50 text-[10px] border-white/10 text-white backdrop-blur-md">
                          STATUS: IN PROGRESS
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                        {language.code === 'es' ? proj.title : (proj.translations?.en?.title || proj.title)}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-3">
                        {language.code === 'es' ? proj.description : (proj.translations?.en?.description || proj.description)}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {proj.tags?.map(tag => (
                          <span key={tag} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </DialogTrigger>

                <DialogContent className="max-w-4xl bg-zinc-950 border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-blue-400">
                      {language.code === 'es' ? proj.title : (proj.translations?.en?.title || proj.title)}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Lado Izquierdo: Video con controles */}
                    <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/5">
                      {proj.video ? (
                        <video src={proj.video} controls autoPlay className="w-full h-full object-contain" />
                      ) : (
                        <img src={proj.image || "/placeholder.svg"} className="w-full h-full object-cover" alt={proj.title} />
                      )}
                    </div>
                    
                    {/* Lado Derecho: Info y CTAs */}
                    <div className="flex flex-col gap-4">
                      <p className="text-slate-300 leading-relaxed">
                        {language.code === 'es' ? proj.description : (proj.translations?.en?.description || proj.description)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {proj.tags?.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex gap-4">
                        {proj.github && (
                          <a href={proj.github} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded text-center text-sm font-semibold transition-colors">
                            GitHub Repo
                          </a>
                        )}
                        {proj.demo && (
                          <a href={proj.demo} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded text-center text-sm font-semibold transition-colors">
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-white/5">
            <p className="text-slate-500 italic">No hay experimentos públicos en este momento. Vuelve pronto.</p>
          </div>
        )}
      </div>
    </section>
  );
}

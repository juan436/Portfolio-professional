"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import {
  Code2, Database, Server, Cpu, Globe, Smartphone, Monitor, Cloud, Shield,
  LineChart, Settings, Layers, Briefcase, PenTool, FileCode, Zap
} from "lucide-react"

interface Service {
  title: string
  description: string
  icon: string
  _id?: string
}

interface AboutServicesProps {
  services: Service[]
}

export function AboutServices({ services }: AboutServicesProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.1 * index },
    }),
  }

  // Mapear los iconos a los componentes correspondientes
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "Code":
        return <Code2 className="h-10 w-10 text-blue-500" />
      case "Server":
        return <Server className="h-10 w-10 text-blue-500" />
      case "Database":
        return <Database className="h-10 w-10 text-blue-500" />
      case "Cpu":
        return <Cpu className="h-10 w-10 text-blue-500" />
      case "Globe":
        return <Globe className="h-10 w-10 text-blue-500" />
      case "Smartphone":
        return <Smartphone className="h-10 w-10 text-blue-500" />
      case "Monitor":
        return <Monitor className="h-10 w-10 text-blue-500" />
      case "Cloud":
        return <Cloud className="h-10 w-10 text-blue-500" />
      case "Shield":
        return <Shield className="h-10 w-10 text-blue-500" />
      case "LineChart":
        return <LineChart className="h-10 w-10 text-blue-500" />
      case "Settings":
        return <Settings className="h-10 w-10 text-blue-500" />
      case "Layers":
        return <Layers className="h-10 w-10 text-blue-500" />
      case "Briefcase":
        return <Briefcase className="h-10 w-10 text-blue-500" />
      case "PenTool":
        return <PenTool className="h-10 w-10 text-blue-500" />
      case "FileCode":
        return <FileCode className="h-10 w-10 text-blue-500" />
      case "Zap":
        return <Zap className="h-10 w-10 text-blue-500" />
      default:
        return <Code2 className="h-10 w-10 text-blue-500" />
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map((service, index) => (
        <motion.div
          key={service._id || `service-${index}-${service.title}`}
          custom={index}
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Card className="bg-black/40 border-blue-700/20 hover:border-blue-700/50 transition-all duration-300 h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-blue-700/10">{getServiceIcon(service.icon)}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-slate-400">{service.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

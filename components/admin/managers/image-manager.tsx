"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Laptop, ImageIcon, FileImage } from "lucide-react"
import { useContent } from "@/contexts/content"

// Importar componentes extraídos
import ImageGuide, { ImageType } from "@/components/admin/common/image-guide"
import PredefinedImages, { PredefinedImage } from "@/components/admin/common/predefined-images"
import ImageServices, { ImageService } from "@/components/admin/common/image-services"

// Tipos de imágenes con información y recomendaciones
const imageTypes: ImageType[] = [
  {
    id: "profile",
    name: "Imagen de Perfil",
    icon: <User className="h-5 w-5 text-blue-500" />,
    description: "Imagen principal que aparece en las secciones Hero y About",
    path: "/images/profile/",
    recommendations: {
      dimensions: "500x500px (cuadrada)",
      format: "PNG o JPG (preferiblemente con fondo transparente)",
      fileSize: "Máximo 500KB",
      examples: ["perfil.jpg", "juan-villegas.png", "foto-profesional.jpg"],
    },
  },
  {
    id: "fullstack",
    name: "Proyectos Fullstack",
    icon: <Laptop className="h-5 w-5 text-blue-500" />,
    description: "Imágenes para proyectos de desarrollo fullstack",
    path: "/images/projects/fullstack/",
    recommendations: {
      dimensions: "1280x720px (16:9) o 1200x800px (3:2)",
      format: "JPG o PNG",
      fileSize: "Máximo 1MB",
      examples: ["ecommerce-dashboard.jpg", "plataforma-elearning.png", "sistema-gestion.jpg"],
    },
  },
]

// Imágenes predefinidas para usar en el portafolio
const predefinedImagesData: { category: string; images: PredefinedImage[] }[] = [
  {
    category: "Fondos",
    images: [
      {
        url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974&auto=format&fit=crop",
        description: "Escritorio con laptop y código",
      },
      {
        url: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2076&auto=format&fit=crop",
        description: "Código en pantalla oscura",
      },
      {
        url: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop",
        description: "Equipo de desarrollo trabajando",
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
        description: "Dashboard de análisis",
      },
    ],
  },
  {
    category: "Proyectos",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=2070&auto=format&fit=crop",
        description: "Reunión de equipo de desarrollo",
      },
      {
        url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop",
        description: "Planificación de proyecto",
      },
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
        description: "Desarrollo web",
      },
      {
        url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop",
        description: "Programación en laptop",
      },
    ],
  },
]

// Servicios recomendados para imágenes
const imageServicesData: ImageService[] = [
  {
    name: "Cloudinary",
    url: "https://cloudinary.com/",
    description:
      "Servicio de gestión de imágenes en la nube con optimización automática, transformaciones y CDN global.",
    features: ["Almacenamiento en la nube", "Optimización automática", "Transformaciones en tiempo real", "CDN global"],
  },
  {
    name: "Vercel Blob",
    url: "https://vercel.com/docs/storage/vercel-blob",
    description:
      "Almacenamiento de archivos optimizado para aplicaciones web con Vercel, ideal para imágenes y assets.",
    features: ["Integración con Vercel", "Optimización de imágenes", "URLs persistentes", "Escalabilidad automática"],
  },
  {
    name: "Imgix",
    url: "https://imgix.com/",
    description: "Plataforma de procesamiento y entrega de imágenes en tiempo real con amplia API de transformación.",
    features: ["Transformaciones en tiempo real", "CDN global", "Optimización automática", "Análisis de rendimiento"],
  },
  {
    name: "TinyPNG",
    url: "https://tinypng.com/",
    description: "Herramienta para comprimir imágenes PNG y JPEG sin pérdida perceptible de calidad.",
    features: ["Compresión inteligente", "API disponible", "Preservación de transparencia", "Procesamiento por lotes"],
  },
]

export default function ImageManager() {
  const { content } = useContent()
  const [activeTab, setActiveTab] = useState("profile")

  // Obtener las imágenes actuales del contenido
  const profileImage =
    content.hero.profileImage ||
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-E9YRocD6o4olhnzraHWCjLmKjCbspw.jpeg"
  const fullstackImages = content.projects.fullstack.map((project) => ({
    url: project.image || "",
    title: project.title,
    id: project.id,
  }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Imágenes del Portafolio</h2>
      </div>

      {/* Información general sobre imágenes */}
      <Card className="bg-black/40 border-blue-700/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="mr-2 h-5 w-5 text-blue-500" />
            Guía de Imágenes para el Portafolio
          </CardTitle>
          <CardDescription>
            Información sobre formatos, dimensiones y recomendaciones para las imágenes de tu portafolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-md mb-4">
            <p className="text-sm text-slate-300 mb-2">
              Esta guía te proporciona información sobre los formatos y dimensiones recomendadas para las imágenes de tu
              portafolio.
            </p>
            <p className="text-sm text-slate-300">
              Para añadir o actualizar imágenes, utiliza las secciones correspondientes:
              <span className="text-blue-400"> Contenido &gt; Hero</span> para la imagen de perfil y
              <span className="text-blue-400"> Proyectos</span> para las imágenes de proyectos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Estructura recomendada para imágenes</h3>
              <div className="bg-black/60 p-3 rounded-md text-xs font-mono text-slate-300">
                <p>/public/images/profile/</p>
                <p>/public/images/projects/fullstack/</p>
                <p>/public/images/projects/backend/</p>
                <p>/public/images/backgrounds/</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Formato de URL</h3>
              <div className="bg-black/60 p-3 rounded-md text-xs font-mono text-slate-300">
                <p>https://tu-dominio.com/images/categoria/nombre-imagen.jpg</p>
              </div>
              <p className="text-xs text-slate-400">
                Asegúrate de que la URL sea accesible públicamente para que se muestre correctamente en tu portafolio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes tipos de imágenes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black/40 border border-blue-700/20 mb-6 grid grid-cols-2">
          {imageTypes.map((type) => (
            <TabsTrigger
              key={type.id}
              value={type.id}
              className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
            >
              <div className="mr-2">{type.icon}</div>
              <span className="hidden sm:inline">{type.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Contenido para cada tipo de imagen usando componentes extraídos */}
        <TabsContent value="profile" className="mt-0 space-y-6">
          <ImageGuide imageType={imageTypes.find(type => type.id === "profile")!} />
          
          <Card className="bg-black/40 border-blue-700/20">
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-4">Imagen de Perfil Actual</h3>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative aspect-square w-full max-w-[200px] border border-blue-700/30 rounded-full overflow-hidden">
                  <img
                    src={profileImage || "/placeholder.svg"}
                    alt="Imagen de perfil actual"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-sm text-slate-300">
                    La imagen de perfil se muestra en las secciones Hero y About. Para actualizarla, ve a la
                    sección "Contenido" del panel administrativo, pestaña "Hero", y actualiza el campo "Imagen de
                    Perfil (URL)".
                  </p>
                  <p className="text-sm text-slate-400">
                    Recomendación: Usa una imagen profesional con buena iluminación y un fondo neutro o
                    transparente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fullstack" className="mt-0 space-y-6">
          <ImageGuide imageType={imageTypes.find(type => type.id === "fullstack")!} />
          
          <Card className="bg-black/40 border-blue-700/20">
            <CardContent className="pt-6">
              <div>
                <h3 className="text-sm font-medium mb-4">Imágenes de Proyectos Fullstack</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Las imágenes de proyectos se configuran en la sección "Proyectos" del panel administrativo. Cada
                  proyecto puede tener su propia imagen representativa.
                </p>

                {fullstackImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fullstackImages.map((image, index) => (
                      <Card key={index} className="bg-black/60 border-blue-700/20 overflow-hidden">
                        <div className="relative h-40">
                          <img
                            src={image.url || "/placeholder.svg?height=160&width=320"}
                            alt={image.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=160&width=320"
                            }}
                          />
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm text-slate-300 mb-2 line-clamp-1">{image.title}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-blue-700/30 rounded-md">
                    <FileImage className="h-12 w-12 mx-auto text-blue-700/50 mb-2" />
                    <p className="text-slate-400">No hay imágenes de proyectos fullstack disponibles.</p>
                  </div>
                )}
              </div>

              {/* Imágenes predefinidas */}
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-4">Imágenes Predefinidas Sugeridas</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Aquí hay algunas imágenes de stock que puedes usar para tus proyectos. Copia la URL y úsala en
                  la sección de proyectos.
                </p>
                <PredefinedImages 
                  images={predefinedImagesData.flatMap(category => category.images)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Servicios recomendados para imágenes */}
      <ImageServices services={imageServicesData} />
    </motion.div>
  )
}

import { MetadataRoute } from "next"

/**
 * Web App Manifest (`app/manifest.ts` → `/manifest.webmanifest`).
 * Recibe: nada.
 * Produce: identidad de la marca Jevy para instalación / integración con el SO.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jevy — Juan Villegas",
    short_name: "Jevy",
    description:
      "Web oficial de Juan Villegas: Arquitecto de Soluciones y Desarrollador Full Stack. Sistemas completos, infraestructura, automatizaciones y agentes de IA.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  }
}

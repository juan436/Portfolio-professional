/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // pdfkit lee sus fuentes (.afm) del disco con rutas relativas a su propio
  // módulo — el bundler (Turbopack/webpack) las reescribe mal si lo empaqueta,
  // tira ENOENT buscando Helvetica.afm en una ruta virtual del bundler.
  // Excluido del bundle: se carga con require() nativo de Node, no bundleado.
  serverExternalPackages: ['pdfkit'],
  // Para Docker necesitamos output: 'standalone'
  output: 'standalone',
}

export default nextConfig

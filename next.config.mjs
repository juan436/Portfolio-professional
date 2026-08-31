/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 ya no corre ESLint en el build (quitado el key `eslint`, tiraba
  // "Unrecognized key"). El lint se corre aparte si hace falta.
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
  // @react-pdf/renderer (usado por @json-render/react-pdf, lib/pdf.ts desde
  // 2026-08-14) usa pdfkit por debajo — mismo riesgo, excluido preventivo.
  serverExternalPackages: ['pdfkit', '@react-pdf/renderer', '@json-render/react-pdf'],
  // Para Docker necesitamos output: 'standalone'
  output: 'standalone',
}

export default nextConfig

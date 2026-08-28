import Link from "next/link"
import { ArrowLeft } from "lucide-react"

/**
 * Armazón compartido de las páginas de detalle (`project` / `automation` /
 * `agent` / `laboratory` / `certificate` -detail-view): `<main>` negro + sección
 * con las 2 líneas de gradiente arriba/abajo + contenedor centrado.
 * Antes estaba copiado idéntico en los 5 archivos.
 */
export function DetailPageShell({
  maxWidthClass,
  children,
}: {
  maxWidthClass?: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-black">
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        </div>
        <div className={`container mx-auto px-6 relative z-10${maxWidthClass ? ` ${maxWidthClass}` : ""}`}>{children}</div>
      </section>
    </main>
  )
}

/**
 * Pantalla "no encontrado" de las páginas de detalle. Idéntica en los 5 archivos
 * salvo el `href` de vuelta y los textos.
 */
export function DetailNotFound({
  message,
  backHref,
  backLabel,
}: {
  message: string
  backHref: string
  backLabel: string
}) {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <p className="text-slate-400 mb-6">{message}</p>
      <Link href={backHref} className="text-blue-500 hover:text-blue-400 inline-flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {backLabel}
      </Link>
    </main>
  )
}

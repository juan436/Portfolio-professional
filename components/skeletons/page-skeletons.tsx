/**
 * Skeletons por página, calcados a la estructura real de cada `loading.tsx`.
 * Todos comparten el fondo negro + `pt-28` del chrome público. Sin JS, solo
 * `animate-pulse`.
 * Recibe: props de forma (columnas, cantidad de cards) según el caso.
 * Produce: bloques pulsantes con el layout de la página que está cargando.
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-white/10 ${className}`} />
}

function Card({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl border border-white/5 bg-white/[0.03] ${className}`} />
}

/** Encabezado centrado (título + subtítulo) que usan casi todas las páginas de listado. */
function CenteredHeader() {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <Bar className="mx-auto h-10 w-2/3 md:h-12" />
      <Bar className="mx-auto mt-4 h-4 w-4/5" />
    </div>
  )
}

/** Listado genérico: header centrado + grilla de cards. `/certificates`, base de otras. */
export function ListPageSkeleton({
  cols = "md:grid-cols-2 lg:grid-cols-3",
  count = 6,
  cardClass = "h-64",
}: {
  cols?: string
  count?: number
  cardClass?: string
}) {
  return (
    <div className="min-h-screen bg-black" aria-hidden>
      <div className="container mx-auto px-6 pt-28 pb-8">
        <CenteredHeader />
        <div className={`grid grid-cols-1 ${cols} gap-6`}>
          {Array.from({ length: count }).map((_, i) => (
            <Card key={i} className={`animate-pulse ${cardClass}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** `/laboratory`: header + 2 expedientes anchos lado a lado + control central. */
export function LaboratorySkeleton() {
  return (
    <div className="min-h-screen bg-black animate-pulse" aria-hidden>
      <div className="container mx-auto px-6 pt-28 pb-8">
        <CenteredHeader />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="h-[420px]" />
          <Card className="h-[420px]" />
        </div>
        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="h-12 w-12 rounded-full border border-blue-700/40" />
          <Bar className="h-3 w-16" />
          <div className="h-12 w-12 rounded-full border border-blue-700/40" />
        </div>
      </div>
    </div>
  )
}

/** `/work`: intro centrada con 3 CTAs + 3 bloques de sección (proyectos / automatizaciones / agentes). */
export function WorkSkeleton() {
  return (
    <div className="min-h-screen bg-black animate-pulse" aria-hidden>
      <div className="pt-28">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <Bar className="mx-auto h-12 w-3/4" />
          <Bar className="mx-auto mt-4 h-4 w-full" />
          <Bar className="mx-auto mt-2 h-4 w-5/6" />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Bar className="h-11 w-44 rounded-full" />
            <Bar className="h-11 w-40 rounded-full" />
            <Bar className="h-11 w-40 rounded-full" />
          </div>
        </div>
        <div className="container mx-auto space-y-16 px-6 py-16">
          {Array.from({ length: 3 }).map((_, s) => (
            <div key={s}>
              <Bar className="mb-6 h-7 w-52" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-72" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** `/blog`: label + destacado grande + lista editorial + columna de temas a la derecha. */
export function BlogSkeleton() {
  return (
    <div className="min-h-screen bg-black animate-pulse" aria-hidden>
      <div className="container mx-auto px-6 pt-28 pb-8">
        <div className="mx-auto max-w-7xl px-8 md:px-10">
          <Bar className="mb-10 h-3 w-16" />
          <div className="md:grid md:grid-cols-[1fr_200px] md:gap-x-16">
            <div className="mb-10 md:order-2 md:mb-0">
              <Bar className="mb-3 h-3 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Bar key={i} className="h-4 w-24" />
                ))}
              </div>
            </div>
            <div className="md:order-1">
              <Card className="mb-8 h-56 rounded-2xl" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-t border-white/[0.08] py-8">
                  <Bar className="h-3 w-40" />
                  <Bar className="mt-3 h-6 w-4/5" />
                  <Bar className="mt-3 h-4 w-full" />
                  <Bar className="mt-2 h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** `/contact`: header + rejilla de 3 columnas (paneles laterales + chat central). */
export function ContactSkeleton() {
  return (
    <div className="min-h-screen bg-black animate-pulse" aria-hidden>
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-6 text-center">
          <Bar className="mx-auto h-12 w-2/3" />
          <Bar className="mx-auto mt-4 h-4 w-3/4" />
        </div>
        <div className="mx-auto mt-6 w-full max-w-[1600px] px-4 lg:px-8">
          <div className="grid grid-cols-1 items-start justify-center gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1000px)_minmax(0,240px)]">
            <Card className="hidden h-96 lg:block" />
            <Card className="h-[560px]" />
            <Card className="hidden h-96 lg:block" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Detalle genérico (`/projects/[slug]`, `/laboratory/[slug]`, `/blog/[slug]`, etc.):
 *  botón volver + título + meta + bloque de contenido ancho. */
export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-black animate-pulse" aria-hidden>
      <div className="container mx-auto max-w-4xl px-6 pt-28 pb-16">
        <Bar className="h-4 w-28" />
        <Bar className="mt-8 h-10 w-4/5 md:h-12" />
        <div className="mt-5 flex gap-3">
          <Bar className="h-4 w-24" />
          <Bar className="h-4 w-20" />
          <Bar className="h-4 w-28" />
        </div>
        <Card className="mt-10 aspect-[16/9] w-full" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Bar key={i} className={`h-4 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

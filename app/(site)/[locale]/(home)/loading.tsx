/**
 * Skeleton del home mientras el Server Component (`page.tsx`) resuelve
 * `getHomeContent()` / `getApprovedTestimonials()`. Réplica de la rejilla del
 * Hero (texto izquierda + avatar circular derecha) más un esbozo de la fila de
 * Servicios, para que el primer paint tenga la forma de la página y no haya
 * salto de layout al hidratar. Solo Tailwind (`animate-pulse`), sin JS.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-black" aria-hidden>
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Columna de texto */}
            <div className="animate-pulse space-y-6">
              <div className="h-7 w-64 rounded-full bg-blue-500/10" />
              <div className="h-12 w-3/4 rounded-lg bg-white/10" />
              <div className="h-8 w-1/2 rounded-lg bg-white/10" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-4 w-11/12 rounded bg-white/5" />
                <div className="h-4 w-4/5 rounded bg-white/5" />
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="h-14 w-56 rounded-md bg-blue-500/20" />
                <div className="h-14 w-44 rounded-md bg-white/10" />
              </div>
              <div className="flex gap-4 pt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-9 w-9 rounded-full bg-white/10" />
                ))}
              </div>
            </div>

            {/* Avatar circular */}
            <div className="flex justify-center">
              <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-white/[0.06] animate-pulse border border-blue-500/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Esbozo de Servicios */}
      <section className="py-16 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 h-8 w-72 rounded-lg bg-white/10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

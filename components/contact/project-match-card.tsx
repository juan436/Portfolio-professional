import Image from "next/image"

export interface ProjectMatch {
  id: string
  title: string
  image: string | null
  path: string
  demo: string | null
  isPrototype: boolean
}

/**
 * Card de proyecto sugerido dentro de una respuesta del chat de Jevy (match del motor determinístico).
 * Extraído de `jevy-chat.tsx` (sesión 2026-08-19) — no depende de estado del chat.
 * Recibe: `match: ProjectMatch` (armado en `app/api/contact/chat/route.ts`) + labels traducidos.
 * Produce: imagen/título + badge "prototipo" si aplica + links a ver más / demo.
 */
interface ProjectMatchCardProps {
  match: ProjectMatch
  prototypeLabel: string
  seeMoreLabel: string
  demoLabel: string
}

export function ProjectMatchCard({ match, prototypeLabel, seeMoreLabel, demoLabel }: ProjectMatchCardProps) {
  return (
    <div className="mt-2 max-w-sm rounded-lg border border-blue-700/30 bg-black/40 overflow-hidden not-italic font-sans">
      {match.image && (
        <div className="relative w-full h-32">
          <Image src={match.image} alt={match.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">{match.title}</span>
        </div>
        {match.isPrototype && (
          <span className="inline-block text-[10px] uppercase tracking-wide text-amber-400 border border-amber-400/30 rounded-full px-2 py-0.5">
            {prototypeLabel}
          </span>
        )}
        <div className="flex gap-2 pt-1">
          <a
            href={match.path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            {seeMoreLabel}
          </a>
          {match.demo && (
            <a
              href={match.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-md border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 transition-colors"
            >
              {demoLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

import { useLanguage } from "@/hooks/use-language"

interface ProjectMatchCardProps {
  title: string
  description: string
  image?: string
  demo?: string
  onViewMore: () => void
}

export function ProjectMatchCard({ title, description, image, demo, onViewMore }: ProjectMatchCardProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-sm rounded-md overflow-hidden border border-blue-700/30 bg-black/40">
      <div className="h-28 bg-gradient-to-br from-blue-950/60 to-black flex items-center justify-center overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs uppercase tracking-widest text-slate-500">{title}</span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="font-bold text-sm">{title}</p>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{description}</p>
        </div>
        <div className="flex gap-2">
          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-semibold rounded-md py-2 bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              {String(t("projects.demo"))}
            </a>
          )}
          <button
            onClick={onViewMore}
            className="flex-1 text-center text-xs font-semibold rounded-md py-2 border border-blue-700/40 text-blue-300 hover:border-blue-500 hover:bg-blue-700/10 transition-colors"
          >
            {String(t("common.seeMore"))}
          </button>
        </div>
      </div>
    </div>
  )
}

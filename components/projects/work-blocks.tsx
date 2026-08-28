/**
 * Renderiza bloques de tipo párrafo o pasos numerados (con línea conectora).
 * Compartido entre `laboratory-detail-view` ("Qué estoy probando" / "Qué
 * aprendí") y `project-detail-view` (acordeón "Cómo trabajé").
 * Recibe: `blocks: WorkBlock[]`.
 */
export interface WorkBlock {
  kind: "paragraph" | "steps"
  text?: string
  items?: string[]
}

export function WorkBlocks({ blocks }: { blocks: WorkBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, bi) =>
        block.kind === "paragraph" ? (
          block.text && (
            <p key={bi} className="text-sm text-slate-300 leading-relaxed">
              {block.text}
            </p>
          )
        ) : (
          block.items &&
          block.items.length > 0 && (
            <div key={bi} className="space-y-6">
              {block.items.map((step, i) => (
                <div key={i} className="relative pl-11">
                  {i < block.items!.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-blue-500/20" />
                  )}
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-300">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed pt-1.5">{step}</p>
                </div>
              ))}
            </div>
          )
        )
      )}
    </div>
  )
}

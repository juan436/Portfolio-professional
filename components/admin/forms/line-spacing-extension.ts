import { Extension } from "@tiptap/core"

/**
 * Espaciado entre líneas por bloque (párrafo/título/cita) — no un ajuste
 * global del documento. Guarda `style="line-height:...` directo en el nodo,
 * así que viaja con el HTML del post y se respeta igual en la vista pública.
 * Recibe: nada (se agrega a `extensions`, sin configuración).
 * Produce: atributo `lineSpacing` en paragraph/heading/blockquote.
 */
export const LineSpacing = Extension.create({
  name: "lineSpacing",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          lineSpacing: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
            renderHTML: (attributes: { lineSpacing?: string | null }) => {
              if (!attributes.lineSpacing) return {}
              return { style: `line-height: ${attributes.lineSpacing}` }
            },
          },
        },
      },
    ]
  },
})

export const LINE_SPACING_OPTIONS = [
  { value: null, label: "Normal" },
  { value: "1.3", label: "Compacto" },
  { value: "2.2", label: "Amplio" },
] as const

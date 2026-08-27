import sanitizeHtml from "sanitize-html"

/**
 * Sanitiza el HTML del cuerpo de un post de blog antes de guardarlo.
 * Recibe: HTML crudo del editor Tiptap (o de la traducción de DeepSeek, o
 * editado a mano en el Admin).
 * Produce: el mismo HTML con solo las etiquetas/atributos/estilos que el
 * editor produce de verdad — se descarta `<script>`, `on*`, `javascript:`, etc.
 *
 * Riesgo real bajo (solo el Admin con login escribe posts) pero cierra la
 * superficie XSS del `dangerouslySetInnerHTML` de la vista pública.
 */
const ALLOWED_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4",
  "strong", "b", "em", "i", "u", "s", "strike", "mark", "sub", "sup",
  "a", "ul", "ol", "li",
  "blockquote", "pre", "code", "span",
  "img",
  "table", "thead", "tbody", "tr", "th", "td",
]

export function sanitizeBlogHtml(html: string | undefined | null): string {
  if (!html) return ""
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "style"],
      code: ["class"],
      pre: ["class"],
      span: ["class", "style"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      blockquote: ["style"],
      li: ["style"],
      mark: ["data-color"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^(left|right|center|justify)$/],
        "line-height": [/^\d+(\.\d+)?$/],
        width: [/^\d+(\.\d+)?px$/, /^\d+(\.\d+)?%$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  })
}

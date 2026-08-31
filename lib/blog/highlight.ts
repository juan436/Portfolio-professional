import { createLowlight, common } from "lowlight"
import { toHtml } from "hast-util-to-html"

/**
 * Resaltado de sintaxis server-only para el cuerpo HTML de un post de blog.
 * Recibe: HTML de Tiptap con bloques `<pre><code class="language-x">…</code></pre>`
 * (el texto adentro viene escapado: `&lt; &gt; &amp; &quot; &#39;`).
 * Produce: el mismo HTML con `<span class="hljs-…">` dentro de cada bloque de código.
 *
 * Se hace al renderizar (no al guardar) porque el editor Tiptap re-parsea el
 * `<pre><code>` al reabrir un post — si los spans estuvieran guardados, se
 * volverían texto literal dentro del editor.
 */
const lowlight = createLowlight(common)

const LANG_ALIASES: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  html: "xml",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  "": "plaintext",
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
}

function highlightCode(rawInner: string, langHint: string): string {
  const code = decodeEntities(rawInner)
  const lang = LANG_ALIASES[langHint] ?? langHint

  try {
    const tree = lang && lowlight.registered(lang) ? lowlight.highlight(lang, code) : lowlight.highlightAuto(code)
    return toHtml(tree)
  } catch {
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }
}

const CODE_BLOCK_RE = /<pre><code(?:\s+class="language-([\w-]+)")?>([\s\S]*?)<\/code><\/pre>/g

export function highlightBlogHtml(html: string | undefined): string {
  if (!html) return ""
  return html.replace(CODE_BLOCK_RE, (_match, lang: string | undefined, inner: string) => {
    const highlighted = highlightCode(inner, lang || "")
    const cls = lang ? ` class="language-${lang} hljs"` : ' class="hljs"'
    return `<pre><code${cls}>${highlighted}</code></pre>`
  })
}

/**
 * Render de texto de chat con markdown mínimo: `**negrita**` + saltos de línea
 * (con gap extra si había una línea en blanco). Sin estado ni hooks — se usa
 * dentro de los componentes de chat (`jevy-chat`, demos de agentes).
 * Extraído de `jevy-chat.tsx` (2026-08-19), consolidado acá (2026-08-27) al
 * estar copiado 3 veces.
 * Recibe: `text: string` (crudo, tal cual devuelve el LLM o el guion del demo).
 * Produce: `renderInline` → JSX con `<strong>` para negritas; `FormattedText` →
 * el texto completo con saltos de línea como `<span class="block">`.
 */
export function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export function FormattedText({ text }: { text: string }) {
  const rawLines = text.split("\n")
  const lines: { text: string; gap: boolean }[] = []
  let pendingGap = false
  for (const line of rawLines) {
    if (line.trim() === "") {
      pendingGap = true
      continue
    }
    lines.push({ text: line, gap: pendingGap && lines.length > 0 })
    pendingGap = false
  }
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className={i === 0 ? "" : "block" + (line.gap ? " mt-2" : "")}>
          {renderInline(line.text)}
        </span>
      ))}
    </>
  )
}

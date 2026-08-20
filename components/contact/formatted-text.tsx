"use client"

function renderInline(text: string) {
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

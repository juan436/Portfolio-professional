import { AUTHOR_DISPLAY_NAME } from "@/lib/site-config"

/**
 * Plantilla compartida de las imágenes Open Graph (`next/og` / `ImageResponse`).
 * Recibe: `label` (etiqueta chica arriba), `title` (grande), `subtitle` opcional.
 * Produce: el árbol JSX que `ImageResponse` renderiza a PNG 1200×630 — fondo
 * negro de marca + glow azul + firma del autor abajo.
 * Usado por el blog (post + listado) y la home.
 */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

export function ogFrame({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "#0a0a0a",
        backgroundImage: "radial-gradient(circle at 82% 0%, rgba(37,99,235,0.38), transparent 55%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "14px", height: "14px", borderRadius: "999px", background: "#3b82f6" }} />
        <div style={{ fontSize: "26px", letterSpacing: "6px", color: "#93c5fd", fontWeight: 700 }}>{label}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? "58px" : "72px",
            lineHeight: 1.12,
            fontWeight: 800,
            color: "#ffffff",
            maxWidth: "1000px",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ display: "flex", fontSize: "30px", color: "#94a3b8", maxWidth: "900px", lineHeight: 1.4 }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "28px", color: "#94a3b8" }}>
        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{AUTHOR_DISPLAY_NAME}</span>
        <span>·</span>
        <span>jevy.dev</span>
      </div>
    </div>
  )
}

import { ImageResponse } from "next/og"

/**
 * Imagen Open Graph del listado `/blog` (`/blog/opengraph-image`).
 * Recibe: nada.
 * Produce: PNG 1200×630 con la plantilla de marca — para cuando se comparte
 * el link del blog entero.
 */
export const alt = "Blog de Ing. Juan Villegas"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
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
          <div style={{ fontSize: "26px", letterSpacing: "6px", color: "#93c5fd", fontWeight: 700 }}>BLOG</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", fontSize: "76px", fontWeight: 800, color: "#ffffff" }}>
            Notas de desarrollo
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#94a3b8", maxWidth: "900px", lineHeight: 1.4 }}>
            Lo que voy aprendiendo mientras construyo software: decisiones técnicas, bugs y cambios de opinión.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "28px", color: "#94a3b8" }}>
          <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Ing. Juan Villegas</span>
          <span>·</span>
          <span>jevy.dev</span>
        </div>
      </div>
    ),
    { ...size }
  )
}

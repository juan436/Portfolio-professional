import { ImageResponse } from "next/og"
import { getBlogPostBySlug } from "@/lib/data/blog"

/**
 * Imagen Open Graph dinámica por artículo (`/blog/[slug]/opengraph-image`).
 * Recibe: `params.slug`.
 * Produce: PNG 1200×630 con el título del post sobre la plantilla de marca —
 * es el respaldo cuando el post no tiene `coverImage` (si lo tiene, `generateMetadata`
 * fija `openGraph.images` con la portada y esa gana sobre este archivo).
 */
export const alt = "Artículo del blog de Ing. Juan Villegas"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  const title = post?.title || "Blog"

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

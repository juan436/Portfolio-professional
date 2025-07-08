import { ImageResponse } from "next/og"

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#000000",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "4px",
        border: "1px solid #333",
        padding: "2px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "1px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            color: "#60a5fa",
            fontFamily: "system-ui",
            lineHeight: "1",
          }}
        >
          JV
        </span>
        <span
          style={{
            fontSize: "6px",
            color: "#ffffff",
            fontFamily: "system-ui",
            lineHeight: "1",
          }}
        >
          DEV
        </span>
      </div>
    </div>,
    {
      ...size,
    },
  )
}

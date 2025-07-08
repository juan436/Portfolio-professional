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
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0px",
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
                        fontSize: "16px",
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
                        fontSize: "8px",
                        color: "#ffffff",
                        fontFamily: "system-ui",
                        lineHeight: "1",
                        marginTop: "-2px",
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

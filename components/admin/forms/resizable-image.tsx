"use client"

import { useRef } from "react"
import { mergeAttributes } from "@tiptap/core"
import TiptapImage from "@tiptap/extension-image"
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react"

/**
 * Extiende el `Image` de Tiptap con un handle de resize (arrastrar la
 * esquina inferior derecha) — el ancho se guarda como `style="width:...px"`
 * en el propio `<img>` del HTML guardado, así que el tamaño se respeta
 * también en la vista pública del post (`.blog-content img` ya tiene
 * `max-width:100%; height:auto`, el ancho puesto acá solo lo acota más).
 * Recibe: mismos atributos que `@tiptap/extension-image` (`src`/`alt`/`title`) + `width` opcional.
 * Produce: nodo Tiptap con NodeView React (handle visible solo cuando el nodo está seleccionado).
 */
const MIN_WIDTH_PX = 100

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const currentWidth = imgRef.current?.getBoundingClientRect().width || 0
    dragState.current = { startX: e.clientX, startWidth: currentWidth }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return
    const delta = e.clientX - dragState.current.startX
    const nextWidth = Math.max(MIN_WIDTH_PX, Math.round(dragState.current.startWidth + delta))
    updateAttributes({ width: `${nextWidth}px` })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    dragState.current = null
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  return (
    <NodeViewWrapper as="span" style={{ display: "inline-block", position: "relative", maxWidth: "100%" }}>
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        title={node.attrs.title || ""}
        style={{ width: node.attrs.width || "auto", maxWidth: "100%", display: "block" }}
        draggable={false}
      />
      {selected && (
        <span
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            position: "absolute",
            right: -6,
            bottom: -6,
            width: 14,
            height: 14,
            borderRadius: 4,
            background: "#3b82f6",
            border: "2px solid #000",
            cursor: "nwse-resize",
            touchAction: "none",
          }}
        />
      )}
    </NodeViewWrapper>
  )
}

export const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.style.width || element.getAttribute("width") || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return { style: `width: ${attributes.width}` }
        },
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})

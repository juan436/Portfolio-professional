import { useCallback, useRef, useState } from "react"

export interface AttachmentResult {
  filename: string
  markdown?: string
  url?: string
  type?: string
  error?: string
}

export const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024
export const ACCEPTED_ATTACHMENT_TYPES =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.html,.htm,.csv,.json,.xml,.jpg,.jpeg,.png"

/**
 * Estado y lógica de los archivos que el lead adjunta en el chat de Jevy.
 * Vive en el componente padre (`Contact`) para que tanto el chat como la
 * card de la columna izquierda lean/actualicen el mismo estado.
 *
 * El contenido convertido (markdown) NO se maneja acá: `/api/contact/attachments`
 * lo guarda en Mongo por `sessionId` y `/api/contact/chat` lo arma solo. Este
 * hook solo lleva la lista para la UI (nombre / estado / link), que se repuebla
 * tras un reload con `loadForSession`.
 *
 * @param tooLargeMessage - Texto a mostrar si un archivo supera `MAX_ATTACHMENT_SIZE_BYTES`.
 * @param genericErrorMessage - Texto a mostrar ante cualquier otro error de subida.
 */
export function useAttachments(tooLargeMessage: string, genericErrorMessage: string) {
  const [attachmentResults, setAttachmentResults] = useState<AttachmentResult[]>([])
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)
  const [attachError, setAttachError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (
    files: File[],
    sessionId: string,
  ): Promise<{ succeeded: AttachmentResult[] } | null> => {
    if (files.length === 0) return null

    const validFiles = files.filter((f) => f.size <= MAX_ATTACHMENT_SIZE_BYTES)
    const tooLarge = files.length - validFiles.length

    setAttachError(tooLarge > 0 ? tooLargeMessage : null)
    if (validFiles.length === 0) return null

    setIsUploadingAttachment(true)

    try {
      const formData = new FormData()
      validFiles.forEach((f) => formData.append("files", f, f.name))
      formData.append("sessionId", sessionId)

      const response = await fetch("/api/contact/attachments", { method: "POST", body: formData })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "upload failed")
      }

      const results = data.results as AttachmentResult[]
      setAttachmentResults((prev) => [...prev, ...results])
      if (results.some((r) => r.error)) {
        setAttachError(genericErrorMessage)
      }

      const succeeded = results.filter((r) => r.markdown)
      return succeeded.length > 0 ? { succeeded } : null
    } catch (error) {
      console.error("Error subiendo adjuntos a Jevy:", error)
      setAttachError(genericErrorMessage)
      return null
    } finally {
      setIsUploadingAttachment(false)
    }
  }

  // Repuebla la lista tras un reload: pregunta al server qué adjuntos ya tiene
  // esta sesión. Se llama cuando cambia el `sessionId` (mount con charla
  // restaurada, o reset por inactividad → lista vacía). `lastLoadRef` descarta
  // la respuesta si mientras tanto salió una carga para otra sesión (en el
  // mount hay un id fresco que enseguida lo reemplaza el restaurado).
  const lastLoadRef = useRef("")
  const loadForSession = useCallback(async (sessionId: string) => {
    if (!sessionId) return
    lastLoadRef.current = sessionId
    try {
      const response = await fetch(`/api/contact/attachments?sessionId=${encodeURIComponent(sessionId)}`)
      const data = await response.json()
      if (lastLoadRef.current !== sessionId) return
      setAttachmentResults(data.success && Array.isArray(data.results) ? data.results : [])
    } catch {
      if (lastLoadRef.current === sessionId) setAttachmentResults([])
    }
  }, [])

  return {
    attachmentResults,
    isUploadingAttachment,
    attachError,
    fileInputRef,
    handleFileSelect,
    loadForSession,
  }
}

export type UseAttachmentsReturn = ReturnType<typeof useAttachments>

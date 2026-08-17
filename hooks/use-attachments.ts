import { useRef, useState } from "react"

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
 */
export function useAttachments(tooLargeMessage: string, genericErrorMessage: string) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [attachmentResults, setAttachmentResults] = useState<AttachmentResult[]>([])
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)
  const [attachError, setAttachError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: File[], sessionId: string): Promise<{ succeeded: AttachmentResult[]; mergedContext: string } | null> => {
    if (files.length === 0) return null

    const validFiles = files.filter((f) => f.size <= MAX_ATTACHMENT_SIZE_BYTES)
    const tooLarge = files.length - validFiles.length

    setAttachError(tooLarge > 0 ? tooLargeMessage : null)
    if (validFiles.length === 0) return null

    setAttachedFiles((prev) => [...prev, ...validFiles])
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
      if (succeeded.length === 0) return null

      // Merge manual (no depender del estado, que todavía no se actualizó — setState es asíncrono)
      const mergedContext = [...attachmentResults, ...results]
        .filter((r) => r.markdown)
        .map((r) => `## ${r.filename}\n${r.markdown}`)
        .join("\n\n")

      return { succeeded, mergedContext }
    } catch (error) {
      console.error("Error subiendo adjuntos a Jevy:", error)
      setAttachError(genericErrorMessage)
      return null
    } finally {
      setIsUploadingAttachment(false)
    }
  }

  const buildAttachmentsContext = () =>
    attachmentResults
      .filter((r) => r.markdown)
      .map((r) => `## ${r.filename}\n${r.markdown}`)
      .join("\n\n")

  return {
    attachedFiles,
    attachmentResults,
    isUploadingAttachment,
    attachError,
    fileInputRef,
    handleFileSelect,
    buildAttachmentsContext,
  }
}

export type UseAttachmentsReturn = ReturnType<typeof useAttachments>

"use client"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { ImageIcon, VideoIcon, Loader2, Trash2, Upload, AlertCircle } from "lucide-react"
import { useMediaActions } from "@/hooks/admin/entities/media/use-media-actions"

/**
 * Uploader de media (imagen o video) del Admin — drag & drop + selector,
 * preview antes/después, progreso real durante la subida, reemplazo sin
 * dejar huérfanos en R2. Un slot por instancia: se usa para `image` y
 * `video`; la galería (`images[]`) lo envuelve para agregar una URL a la vez.
 * Recibe: `kind` ("image"|"video"), `value` (URL actual o vacío), `onChange`,
 * `disabled?`, `label?`.
 * Produce: llama `onChange(url)` con la URL pública final de R2 al terminar.
 */
interface MediaUploaderProps {
  kind: "image" | "video"
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  label?: string
}

const ACCEPT: Record<"image" | "video", string> = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/avif",
  video: "video/mp4,video/webm,video/quicktime",
}

export function MediaUploader({ kind, value, onChange, disabled, label }: MediaUploaderProps) {
  const { state, uploadImage, uploadVideo, removeMedia, reset } = useMediaActions()
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isUploading = state.status === "uploading" || state.status === "confirming"

  const handleFile = useCallback(
    async (file: File) => {
      const previousValue = value
      try {
        const url = kind === "image" ? await uploadImage(file) : await uploadVideo(file)
        onChange(url)
        if (previousValue) removeMedia(previousValue)
      } catch {
        // El hook ya mostró el toast de error — nada más que hacer acá.
      }
    },
    [kind, onChange, uploadImage, uploadVideo, removeMedia, value]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled || isUploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const handleRemove = () => {
    if (value) removeMedia(value)
    onChange("")
    reset()
  }

  const Icon = kind === "image" ? ImageIcon : VideoIcon

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {value && !isUploading && (
        <div className="relative rounded-md border border-blue-700/20 bg-black/20 p-2">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="max-h-40 rounded-md object-contain mx-auto" />
          ) : (
            <video src={value} controls className="max-h-40 w-full rounded-md" />
          )}
          {!disabled && (
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" size="sm" variant="outline" className="border-blue-700/50 text-blue-500" onClick={() => inputRef.current?.click()}>
                Reemplazar
              </Button>
              <Button type="button" size="sm" variant="outline" className="border-red-700/50 text-red-500" onClick={handleRemove}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Quitar
              </Button>
            </div>
          )}
        </div>
      )}

      {(!value || isUploading) && !disabled && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={
            "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center cursor-pointer transition-colors " +
            (dragOver ? "border-blue-500 bg-blue-500/10" : "border-blue-700/30 bg-black/20 hover:border-blue-500/50")
          }
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <p className="text-sm text-slate-400">{state.status === "confirming" ? "Confirmando…" : `Subiendo… ${state.progress}%`}</p>
              <Progress value={state.progress} className="h-1.5 w-full max-w-[200px]" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-slate-500">
                <Icon className="h-5 w-5" />
                <Upload className="h-4 w-4" />
              </div>
              <p className="text-sm text-slate-400">Arrastrá {kind === "image" ? "una imagen" : "un video"} o hacé clic para elegir</p>
            </>
          )}
        </div>
      )}

      {state.status === "error" && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {state.error}
        </p>
      )}

      <input ref={inputRef} type="file" accept={ACCEPT[kind]} onChange={onSelect} className="hidden" disabled={disabled || isUploading} />
    </div>
  )
}

"use server"

import { PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import sharp from "sharp"
import { requireAdminSession } from "@/lib/actions/shared"
import { getR2Client, getR2BucketName, isR2Configured, publicUrlForKey, keyFromPublicUrl } from "@/lib/storage/r2"

/**
 * Server Actions de media del Admin (Parte A del plan de storage R2) — imagen
 * y video que hoy son URL de texto plano en `models/project.model.ts`
 * (`image`/`images`/`video`). Subida en modo presigned URL: el navegador sube
 * directo a R2, este archivo solo firma/valida/confirma/borra.
 * Recibe: `prepareImageUploadAction` un `FormData` con `file`;
 * `prepareVideoUploadAction`/`confirmMediaUploadAction` metadata del archivo;
 * `deleteMediaAction` la URL pública ya guardada en el proyecto.
 * Produce: `{ uploadUrl, key, publicUrl, ... }` para que el cliente haga el
 * `PUT` directo a R2, o `{ url }`/`{ success }` según la acción.
 */
// Imágenes: se comprimen server-side con sharp ANTES de firmar (el navegador
// no puede correr sharp) — por eso el flujo de imagen es un solo Server
// Action que recibe el archivo original, lo comprime, y devuelve junto con
// la URL firmada el buffer ya comprimido (base64) para que el cliente haga
// el PUT directo a R2 con ESE buffer. El servidor nunca sube el archivo él
// mismo a R2 — solo procesa y firma, sigue siendo "navegador sube directo".
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"])
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"])

// Límites elegidos para no volar la capa gratis de R2 (10GB storage / mes) —
// sin credenciales reales para calibrar contra uso real, valor conservador
// a revisar por el usuario si hace falta.
const MAX_IMAGE_RAW_BYTES = 15 * 1024 * 1024 // 15MB antes de comprimir
const MAX_VIDEO_BYTES = 200 * 1024 * 1024 // 200MB, sin transcodificar (fuera de alcance)

const IMAGE_MAX_DIMENSION = 1920

function assertConfigured() {
  if (!isR2Configured()) {
    throw new Error("Almacenamiento R2 no configurado todavía — faltan variables en .env (ver planes/admin-upload-media-cloudflare-r2.md)")
  }
}

function safeFilenameSegment(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

function buildKey(kind: "image" | "video", filename: string): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const rand = Math.random().toString(36).slice(2, 10)
  return `projects/${kind}s/${yyyy}/${mm}/${Date.now()}-${rand}-${safeFilenameSegment(filename)}`
}

export interface PreparedUpload {
  uploadUrl: string
  key: string
  publicUrl: string
  contentType: string
  /** Solo para imágenes: el buffer ya comprimido, en base64, listo para el PUT del cliente. */
  fileBase64?: string
  size: number
}

/**
 * Imagen: valida, comprime/redimensiona con sharp (máx. 1920px, WebP calidad
 * 82) y firma el PUT contra la key resultante. El cliente hace el `fetch`
 * PUT directo a R2 con el `fileBase64` devuelto (decodificado a Blob).
 */
export async function prepareImageUploadAction(formData: FormData): Promise<PreparedUpload> {
  await requireAdminSession()
  assertConfigured()

  const file = formData.get("file")
  if (!(file instanceof File)) throw new Error("Archivo de imagen no recibido")
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`Tipo de imagen no soportado: ${file.type || "desconocido"}`)
  }
  if (file.size > MAX_IMAGE_RAW_BYTES) {
    throw new Error(`Imagen demasiado grande (máx. ${Math.round(MAX_IMAGE_RAW_BYTES / 1024 / 1024)}MB)`)
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())
  const compressed = await sharp(rawBuffer)
    .rotate()
    .resize({ width: IMAGE_MAX_DIMENSION, height: IMAGE_MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  const baseName = file.name.replace(/\.[^/.]+$/, "")
  const key = buildKey("image", `${baseName}.webp`)
  const contentType = "image/webp"

  const command = new PutObjectCommand({ Bucket: getR2BucketName(), Key: key, ContentType: contentType })
  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 300 })

  return {
    uploadUrl,
    key,
    publicUrl: publicUrlForKey(key),
    contentType,
    fileBase64: compressed.toString("base64"),
    size: compressed.length,
  }
}

/**
 * Video: sin transcodificar (fuera de alcance) — solo valida tipo/tamaño y
 * firma el PUT. El cliente sube el archivo original directo a R2.
 */
export async function prepareVideoUploadAction(params: { filename: string; contentType: string; size: number }): Promise<PreparedUpload> {
  await requireAdminSession()
  assertConfigured()

  const { filename, contentType, size } = params
  if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
    throw new Error(`Tipo de video no soportado: ${contentType || "desconocido"}`)
  }
  if (size > MAX_VIDEO_BYTES) {
    throw new Error(`Video demasiado grande (máx. ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)}MB)`)
  }

  const key = buildKey("video", filename)
  const command = new PutObjectCommand({ Bucket: getR2BucketName(), Key: key, ContentType: contentType })
  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 300 })

  return { uploadUrl, key, publicUrl: publicUrlForKey(key), contentType, size }
}

/**
 * Confirma que el objeto realmente llegó a R2 (HeadObjectCommand) — el PUT
 * presigned puede fallar en el navegador (típicamente CORS del bucket, ver
 * A5 del plan) sin que el Admin se entere si no se confirma. Devuelve la URL
 * pública final para guardar en el campo del proyecto.
 */
export async function confirmMediaUploadAction(params: { key: string }): Promise<{ url: string }> {
  await requireAdminSession()
  assertConfigured()

  await getR2Client().send(new HeadObjectCommand({ Bucket: getR2BucketName(), Key: params.key }))
  return { url: publicUrlForKey(params.key) }
}

/**
 * Borra un objeto de R2 dado su URL pública ya guardada en el proyecto — se
 * usa al reemplazar o quitar media desde el Admin, para no dejar huérfanos.
 * Si la URL no pertenece al bucket configurado (ej. un path viejo de
 * `public/`), no hace nada y devuelve éxito igual — nunca se migran esos
 * archivos, así que no hay nada que borrar en R2.
 */
export async function deleteMediaAction(params: { url: string }): Promise<{ success: true; skipped?: boolean }> {
  await requireAdminSession()

  const key = keyFromPublicUrl(params.url)
  if (!key || !isR2Configured()) return { success: true, skipped: true }

  await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2BucketName(), Key: key }))
  return { success: true }
}

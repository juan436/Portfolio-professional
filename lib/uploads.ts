import { PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getR2Client, getR2BucketName, publicUrlForKey } from '@/lib/storage/r2';

/**
 * Storage de adjuntos de leads — Cloudflare R2 (S3-compatible), migrado de
 * disco local (decisión 2026-08-24, ver dev-aguila-azul/vault/portfolio:
 * planes/admin-upload-media-cloudflare-r2.md, Parte B). Antes vivía en
 * `uploads/` en disco (decisión 2026-08-13, ver planes/levantamiento-
 * informacion-jevy) — sin volumen persistente en el docker-compose del VPS,
 * los adjuntos se perdían en cada redeploy. R2 resuelve eso de paso.
 * Recibe: sessionId + filename + buffer al guardar; sessionId al listar/leer.
 * Produce: URL pública de R2 + operaciones save/read/list — misma firma
 * de `saveLeadFile`/`readLeadFile`/`listSessionFiles` que antes (salvo el
 * campo `diskPath` -> `key`), para no romper `app/api/contact/attachments/
 * route.ts` ni `lib/closing-actions.ts`.
 */
const LEADS_PREFIX = 'leads';

const EXT_CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.zip': 'application/zip',
};

function extname(filename: string): string {
  const i = filename.lastIndexOf('.');
  return i === -1 ? '' : filename.slice(i).toLowerCase();
}

function contentTypeForFilename(filename: string): string {
  return EXT_CONTENT_TYPES[extname(filename)] || 'application/octet-stream';
}

function safeSegment(segment: string): string {
  // Sin '..' ni separadores de ruta — evita path traversal en sessionId/filename,
  // que vienen del cliente.
  return segment.replace(/[/\\]/g, '_').replace(/\.\./g, '_');
}

function leadKey(sessionId: string, filename: string): string {
  return `${LEADS_PREFIX}/${safeSegment(sessionId)}/${safeSegment(filename)}`;
}

// Expuesto para `lib/closing-actions.ts` — arma la URL pública sin subir
// nada, para adjuntos que `listSessionFiles` ya confirmó que existen.
export function leadFileUrl(sessionId: string, filename: string): string {
  return publicUrlForKey(leadKey(sessionId, filename));
}

export async function saveLeadFile(sessionId: string, filename: string, buffer: Buffer): Promise<{ url: string; key: string }> {
  const key = leadKey(sessionId, filename);
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
      Body: buffer,
      ContentType: contentTypeForFilename(filename),
    })
  );
  return { url: publicUrlForKey(key), key };
}

export async function readLeadFile(sessionId: string, filename: string): Promise<Buffer> {
  const key = leadKey(sessionId, filename);
  const result = await getR2Client().send(new GetObjectCommand({ Bucket: getR2BucketName(), Key: key }));
  const body = result.Body;
  if (!body) throw new Error(`Archivo no encontrado en R2: ${key}`);
  // El SDK v3 agrega helpers de conversión (`transformToByteArray`) al Body
  // en runtime Node — no es un Buffer plano.
  const bytes = await (body as unknown as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray();
  return Buffer.from(bytes);
}

export async function listSessionFiles(sessionId: string): Promise<string[]> {
  const prefix = `${LEADS_PREFIX}/${safeSegment(sessionId)}/`;
  try {
    const result = await getR2Client().send(new ListObjectsV2Command({ Bucket: getR2BucketName(), Prefix: prefix }));
    return (result.Contents || [])
      .map((obj) => obj.Key || '')
      .filter((key) => key.length > prefix.length)
      .map((key) => key.slice(prefix.length));
  } catch {
    return [];
  }
}

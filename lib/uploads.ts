import fs from 'fs/promises';
import path from 'path';

/**
 * Storage en disco de adjuntos de leads (fuera de `public/`).
 * Recibe: sessionId + filename + buffer al guardar; sessionId al listar/leer.
 * Produce: URL pública vía `app/api/uploads/[...path]` + operaciones save/read/list.
 */
// Storage en disco del VPS (decisión 2026-08-13, ver dev-aguila-azul/vault/
// portfolio: planes/levantamiento-informacion-jevy) — sin servicio nuevo.
// Los archivos quedan fuera de `public/` a propósito (no depender de que el
// build copie algo escrito en runtime); se sirven vía app/api/uploads/[...path].
//
// IMPORTANTE PARA DESPLIEGUE: este directorio necesita un volumen persistente
// en el docker-compose del VPS — sin eso, los adjuntos se pierden en cada
// redeploy. Pendiente de que el usuario lo agregue al compose.

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

function safeSegment(segment: string): string {
  // Sin '..' ni separadores de ruta — evita path traversal en sessionId/filename,
  // que vienen del cliente.
  return segment.replace(/[/\\]/g, '_').replace(/\.\./g, '_');
}

export async function saveLeadFile(sessionId: string, filename: string, buffer: Buffer): Promise<{ url: string; diskPath: string }> {
  const safeSession = safeSegment(sessionId);
  const safeFilename = safeSegment(filename);
  const dir = path.join(UPLOADS_ROOT, 'leads', safeSession);
  await fs.mkdir(dir, { recursive: true });

  const diskPath = path.join(dir, safeFilename);
  await fs.writeFile(diskPath, buffer);

  return { url: `/api/uploads/leads/${safeSession}/${safeFilename}`, diskPath };
}

export async function readLeadFile(sessionId: string, filename: string): Promise<Buffer> {
  const safeSession = safeSegment(sessionId);
  const safeFilename = safeSegment(filename);
  return fs.readFile(path.join(UPLOADS_ROOT, 'leads', safeSession, safeFilename));
}

export async function listSessionFiles(sessionId: string): Promise<string[]> {
  const safeSession = safeSegment(sessionId);
  const dir = path.join(UPLOADS_ROOT, 'leads', safeSession);
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

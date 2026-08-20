import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * `/api/uploads/[...path]` — sirve los archivos guardados por lib/uploads.ts (adjuntos de leads).
 * Recibe: `params.path` (segmentos de ruta, ej. `leads/{sessionId}/{filename}`).
 * Procesa: valida que no haya `..` y que el path resuelto quede dentro de `UPLOADS_ROOT`.
 * Produce: el archivo con el Content-Type según extensión, o 400/404.
 */
const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

const CONTENT_TYPES: Record<string, string> = {
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
  '.xml': 'application/xml',
  '.html': 'text/html',
  '.htm': 'text/html',
};

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  // Sin '..' — evita salir de UPLOADS_ROOT
  if (!segments || segments.some((s) => s.includes('..'))) {
    return NextResponse.json({ success: false, message: 'Ruta inválida' }, { status: 400 });
  }

  const filePath = path.join(UPLOADS_ROOT, ...segments);
  if (!filePath.startsWith(UPLOADS_ROOT)) {
    return NextResponse.json({ success: false, message: 'Ruta inválida' }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Archivo no encontrado' }, { status: 404 });
  }
}

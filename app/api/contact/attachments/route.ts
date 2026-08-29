import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import SessionAttachment from '@/models/session-attachment.model';
import { saveLeadFile } from '@/lib/uploads';
import { isRateLimited, getClientIp } from '@/lib/rate-limit';

/**
 * `/api/contact/attachments`
 *  - POST: convierte los archivos que el lead adjunta. Rate-limit por IP,
 *    reenvía cada archivo a `markdown-transformer` (`/convert`), guarda el
 *    original en R2 (lib/uploads.ts) y el markdown en `SessionAttachment` (para
 *    que `/api/contact/chat` lo lea por `sessionId` y sobreviva un reload).
 *  - GET `?sessionId=…`: lista los adjuntos ya procesados de esa sesión
 *    (filename/type/url, sin el markdown) — el cliente lo usa al montar para
 *    repintar la lista tras un reload.
 */
const ATTACHMENTS_IP_LIMIT = 15;
const ATTACHMENTS_IP_WINDOW_MS = 10 * 60 * 1000;

interface AttachmentResult {
  filename: string;
  markdown?: string;
  url?: string;
  type?: string;
  error?: string;
}

async function convertOne(file: File, baseUrl: string, apiKey: string, sessionId: string): Promise<AttachmentResult> {
  const forwardForm = new FormData();
  forwardForm.append('file', file, file.name);

  try {
    const response = await fetch(`${baseUrl}/convert`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
      body: forwardForm,
    });

    if (!response.ok) {
      const detail = await response.text();
      return { filename: file.name, error: `Conversion failed (${response.status}): ${detail}` };
    }

    const data = await response.json();

    // Guarda el archivo original en disco (además de convertirlo) — se
    // asocia al Lead/JobOffer cuando la charla cierra. Si esto falla, la
    // conversión igual sirvió de contexto para la charla, no se corta nada.
    let url: string | undefined;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const saved = await saveLeadFile(sessionId, file.name, buffer);
      url = saved.url;
    } catch (saveError) {
      console.error('Error guardando adjunto en disco:', saveError);
    }

    const markdown = data.markdown as string;
    const type = file.type || 'application/octet-stream';

    // El markdown va a Mongo para que /api/contact/chat lo arme por sessionId
    // (así sobrevive un reload). Si esto falla, la conversión igual sirve para
    // ESTE turno vía el fallback del body — no se corta nada.
    try {
      await SessionAttachment.findOneAndUpdate(
        { sessionId, filename: file.name },
        { sessionId, filename: file.name, markdown, type, url },
        { upsert: true, new: true },
      );
    } catch (dbError) {
      console.error('Error guardando el markdown del adjunto en Mongo:', dbError);
    }

    return { filename: file.name, markdown, url, type };
  } catch (error) {
    return { filename: file.name, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ success: false, message: 'sessionId es requerido' }, { status: 400 });
  }
  try {
    await dbConnect();
    const docs = await SessionAttachment.find({ sessionId }).select('filename type url').sort({ createdAt: 1 }).lean();
    const results = docs.map((d) => ({ filename: d.filename, type: d.type, url: d.url }));
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error listando adjuntos de la sesión:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(`attachments:${getClientIp(request)}`, ATTACHMENTS_IP_LIMIT, ATTACHMENTS_IP_WINDOW_MS)) {
      return NextResponse.json({ success: false, message: 'Demasiadas solicitudes, intenta de nuevo en unos minutos' }, { status: 429 });
    }

    await dbConnect();

    const baseUrl = process.env.MARKDOWN_TRANSFORMER_URL;
    const apiKey = process.env.MARKDOWN_TRANSFORMER_API_KEY;

    if (!baseUrl || !apiKey || apiKey === 'PENDIENTE') {
      return NextResponse.json(
        { success: false, message: 'Servicio de conversión no configurado' },
        { status: 503 },
      );
    }

    const form = await request.formData();
    const files = form.getAll('files').filter((f): f is File => f instanceof File);
    const sessionId = String(form.get('sessionId') || '');

    if (files.length === 0) {
      return NextResponse.json({ success: false, message: 'No se recibió ningún archivo' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'sessionId es requerido' }, { status: 400 });
    }

    const results = await Promise.all(files.map((file) => convertOne(file, baseUrl, apiKey, sessionId)));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error convirtiendo adjuntos:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}

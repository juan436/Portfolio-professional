import { NextResponse } from 'next/server';

interface AttachmentResult {
  filename: string;
  markdown?: string;
  error?: string;
}

async function convertOne(file: File, baseUrl: string, apiKey: string): Promise<AttachmentResult> {
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
    return { filename: file.name, markdown: data.markdown as string };
  } catch (error) {
    return { filename: file.name, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: Request) {
  try {
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

    if (files.length === 0) {
      return NextResponse.json({ success: false, message: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const results = await Promise.all(files.map((file) => convertOne(file, baseUrl, apiKey)));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error convirtiendo adjuntos:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}

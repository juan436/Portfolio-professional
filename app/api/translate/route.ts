import { NextResponse } from 'next/server';
import { askDeepSeek } from '@/lib/deepseek';

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'español',
  en: 'inglés',
  fr: 'francés',
  it: 'italiano',
};

// POST: Traduce un texto vía DeepSeek. Corre en el servidor a propósito —
// TOKEN_DEEPSEEK es secreto de servidor, no puede llamarse directo desde el
// navegador (donde vive el llamador real, services/client/translation.ts).
export async function POST(request: Request) {
  try {
    const { text, source, target } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, message: 'text requerido' }, { status: 400 });
    }
    if (!target || typeof target !== 'string') {
      return NextResponse.json({ success: false, message: 'target requerido' }, { status: 400 });
    }

    const sourceName = source && source !== 'auto' ? LANGUAGE_NAMES[source] || source : null;
    const targetName = LANGUAGE_NAMES[target] || target;

    const reply = await askDeepSeek([
      {
        role: 'system',
        content: `Traducí el texto del usuario${sourceName ? ` de ${sourceName}` : ''} a ${targetName}. Devolvé ÚNICAMENTE la traducción, sin comillas, sin notas, sin explicaciones.`,
      },
      { role: 'user', content: text },
    ]);

    return NextResponse.json({ translatedText: reply.content || text });
  } catch (error) {
    console.error('Error traduciendo texto:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}

/**
 * Servicio de traducción vía DeepSeek (app/api/translate, server-side —
 * TOKEN_DEEPSEEK es secreto de servidor, este archivo corre en el navegador)
 */
import { getApiUrl } from '@/utils/url';

export type SupportedLanguage = 'es' | 'en' | 'fr' | 'it';

export async function translateText(
  text: string,
  source: SupportedLanguage | 'auto',
  target: SupportedLanguage
): Promise<string> {
  try {
    const response = await fetch(`${getApiUrl()}/translate`, {
      method: 'POST',
      body: JSON.stringify({ text, source, target }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error en la traducción (${response.status}):`, errorText);
      throw new Error(`Error en la traducción: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Error detallado al traducir texto:', error);
    return text;
  }
}

export async function translateObject<T extends Record<string, any>>(
  obj: T,
  sourceLanguage: SupportedLanguage,
  targetLanguages: SupportedLanguage[],
  fieldsToTranslate: (keyof T)[]
): Promise<{ [key in SupportedLanguage]?: Partial<T> }> {
  const translations: { [key in SupportedLanguage]?: Partial<T> } = {};

  for (const targetLang of targetLanguages) {
    if (targetLang === sourceLanguage) continue;

    const translatedObj: Partial<T> = {};

    for (const field of fieldsToTranslate) {
      if (obj[field] && typeof obj[field] === 'string') {
        const translatedText = await translateText(
          obj[field] as string,
          sourceLanguage,
          targetLang
        );
        translatedObj[field] = translatedText as any;
      } else if (Array.isArray(obj[field])) {
        const translatedArray = await Promise.all(
          obj[field].map((item: string) =>
            typeof item === 'string'
              ? translateText(item, sourceLanguage, targetLang)
              : item
          )
        );
        translatedObj[field] = translatedArray as any;
      }
    }

    translations[targetLang] = translatedObj;
  }

  return translations;
}

export async function translateAndAddToObject<T extends Record<string, any>>(
  obj: T,
  sourceLanguage: SupportedLanguage = 'es',
  targetLanguages: SupportedLanguage[] = ['en', 'fr', 'it'],
  fieldsToTranslate: (keyof T)[]
): Promise<T & { translations: { [key in SupportedLanguage]?: Partial<T> } }> {
  const translations = await translateObject(
    obj,
    sourceLanguage,
    targetLanguages,
    fieldsToTranslate
  );

  const result = {
    ...obj,
    translations: translations as any
  };
  
  return result;
}

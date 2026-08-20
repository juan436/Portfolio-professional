import { askDeepSeek } from "@/lib/deepseek"

/**
 * Traducción server-only de campos de contenido vía DeepSeek, en paralelo.
 * Recibe: `translateObject`/`translateAndAddToObject(obj, sourceLanguage, targetLanguages, fieldsToTranslate)`.
 * Produce: mapa idioma→campos traducidos, o el objeto original con `translations` agregado.
 */
// Versión server-only de services/client/translation.ts — para usar desde
// Server Actions (lib/actions/*.ts), sin el salto HTTP a /api/translate
// (ese endpoint existe solo porque el navegador no puede llamar a DeepSeek
// directo, TOKEN_DEEPSEEK es secreto de servidor). Acá ya estamos en el
// servidor, así que se llama askDeepSeek() directo.
//
// Además paraleliza: la versión cliente traducía campo por campo, uno detrás
// de otro (`for` con `await` adentro) — acá se dispara todo junto con
// Promise.all, mismo resultado, sin la espera secuencial.

export type SupportedLanguage = "es" | "en" | "fr" | "it"

const LANGUAGE_NAMES: Record<string, string> = {
  es: "español",
  en: "inglés",
  fr: "francés",
  it: "italiano",
}

async function translateText(text: string, source: SupportedLanguage | "auto", target: SupportedLanguage): Promise<string> {
  try {
    const sourceName = source !== "auto" ? LANGUAGE_NAMES[source] || source : null
    const targetName = LANGUAGE_NAMES[target] || target

    const reply = await askDeepSeek([
      {
        role: "system",
        content: `Traducí el texto del usuario${sourceName ? ` de ${sourceName}` : ""} a ${targetName}. Devolvé ÚNICAMENTE la traducción, sin comillas, sin notas, sin explicaciones.`,
      },
      { role: "user", content: text },
    ])
    return reply.content || text
  } catch (error) {
    console.error("Error traduciendo texto:", error)
    return text
  }
}

/**
 * Traduce un objeto con campos de texto a varios idiomas destino, en
 * paralelo (todos los campos x todos los idiomas a la vez).
 */
export async function translateObject<T extends Record<string, any>>(
  obj: T,
  sourceLanguage: SupportedLanguage,
  targetLanguages: SupportedLanguage[],
  fieldsToTranslate: (keyof T)[]
): Promise<{ [key in SupportedLanguage]?: Partial<T> }> {
  const jobs: { lang: SupportedLanguage; field: keyof T; isArray: boolean }[] = []

  for (const targetLang of targetLanguages) {
    if (targetLang === sourceLanguage) continue
    for (const field of fieldsToTranslate) {
      const value = obj[field]
      if (typeof value === "string" && value.trim() !== "") {
        jobs.push({ lang: targetLang, field, isArray: false })
      } else if (Array.isArray(value)) {
        jobs.push({ lang: targetLang, field, isArray: true })
      }
    }
  }

  const results = await Promise.all(
    jobs.map(async (job) => {
      const value = obj[job.field]
      if (job.isArray) {
        const translatedArray = await Promise.all(
          (value as unknown[]).map((item) =>
            typeof item === "string" ? translateText(item, sourceLanguage, job.lang) : item
          )
        )
        return { ...job, value: translatedArray }
      }
      const translatedText = await translateText(value as string, sourceLanguage, job.lang)
      return { ...job, value: translatedText }
    })
  )

  const translations: { [key in SupportedLanguage]?: Partial<T> } = {}
  for (const result of results) {
    if (!translations[result.lang]) translations[result.lang] = {}
    ;(translations[result.lang] as any)[result.field] = result.value
  }
  return translations
}

/**
 * Traduce un objeto y le agrega el campo `translations` — misma forma que
 * la versión cliente (translateAndAddToObject), para no romper el shape que
 * ya esperan los modelos de Mongo.
 */
export async function translateAndAddToObject<T extends Record<string, any>>(
  obj: T,
  sourceLanguage: SupportedLanguage = "es",
  targetLanguages: SupportedLanguage[] = ["en", "fr", "it"],
  fieldsToTranslate: (keyof T)[]
): Promise<T & { translations: { [key in SupportedLanguage]?: Partial<T> } }> {
  const translations = await translateObject(obj, sourceLanguage, targetLanguages, fieldsToTranslate)
  return { ...obj, translations }
}

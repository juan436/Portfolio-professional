import { askDeepSeek } from "@/lib/deepseek"

/**
 * Traducción server-only de campos de contenido vía DeepSeek, en paralelo.
 * Recibe: `translateObject`/`translateAndAddToObject(obj, sourceLanguage, targetLanguages, fieldsToTranslate)`.
 * Produce: mapa idioma→campos traducidos, o el objeto original con `translations` agregado.
 */

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

const HTML_MAX_TOKENS = 4000

export async function translateHtml(html: string, targetLang: SupportedLanguage): Promise<string> {
  if (!html || html.trim() === "") return html
  try {
    const targetName = LANGUAGE_NAMES[targetLang] || targetLang
    const reply = await askDeepSeek(
      [
        {
          role: "system",
          content: `Traducí a ${targetName} SOLO el texto visible del HTML del usuario. Conservá las etiquetas y atributos exactamente igual (mismas etiquetas, mismo orden, mismos atributos, mismos href). No traduzcas el contenido de bloques <code> o <pre>. Devolvé ÚNICAMENTE el HTML resultante, sin comillas, sin markdown, sin explicaciones.`,
        },
        { role: "user", content: html },
      ],
      HTML_MAX_TOKENS
    )
    return reply.content || html
  } catch (error) {
    console.error("Error traduciendo HTML:", error)
    return html
  }
}

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

export async function translateAndAddToObject<T extends Record<string, any>>(
  obj: T,
  sourceLanguage: SupportedLanguage = "es",
  targetLanguages: SupportedLanguage[] = ["en", "fr", "it"],
  fieldsToTranslate: (keyof T)[]
): Promise<T & { translations: { [key in SupportedLanguage]?: Partial<T> } }> {
  const translations = await translateObject(obj, sourceLanguage, targetLanguages, fieldsToTranslate)
  return { ...obj, translations }
}

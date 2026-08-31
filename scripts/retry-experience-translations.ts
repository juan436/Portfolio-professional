/**
 * Reintenta las traducciones en/fr/it de `experiences` que quedaron en
 * fallback-ES (la API de DeepSeek venía con timeouts intermitentes en el
 * script rework-experience-2026-08-31). Solo toca los campos que siguen en
 * español. Idempotente: correr las veces que haga falta.
 *
 * Uso: pnpm dlx tsx --env-file=.env scripts/retry-experience-translations.ts
 */
import dbConnect from "../lib/db/conection"
import Experience from "../models/experience.model"
import { askDeepSeek } from "../lib/deepseek"

const LANGS = { en: "inglés", fr: "francés", it: "italiano" } as const
const FIELDS = ["position", "description", "location"] as const

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function translate(text: string, langName: string): Promise<string | null> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const reply = await askDeepSeek([
        {
          role: "system",
          content: `Traduce el texto del usuario de español a ${langName}. Devuelve ÚNICAMENTE la traducción, sin comillas, sin notas.`,
        },
        { role: "user", content: text },
      ])
      const out = reply.content?.trim()
      if (out) return out
    } catch (e: any) {
      console.log(`   intento ${attempt} falló (${e?.cause?.code || e?.message}); reintento...`)
      await sleep(2000 * attempt)
    }
  }
  return null
}

async function run() {
  await dbConnect()
  const docs = await Experience.find({}).lean()

  for (const doc of docs as any[]) {
    const es = { position: doc.position, description: doc.description, location: doc.location || "" }
    for (const [code, name] of Object.entries(LANGS)) {
      const cur = doc.translations?.[code] || {}
      const pending = FIELDS.filter((f) => es[f] && (!cur[f] || cur[f] === es[f]))
      if (pending.length === 0) continue
      console.log(`${doc.company} · ${code}: traduciendo ${pending.join(", ")}`)
      const patch: Record<string, string> = {}
      for (const f of pending) {
        const t = await translate(es[f], name)
        if (t && t !== es[f]) patch[`translations.${code}.${f}`] = t
        else console.log(`   ⚠ ${f} no se pudo traducir`)
      }
      if (Object.keys(patch).length) {
        await Experience.updateOne({ _id: doc._id }, { $set: patch })
        console.log(`   ✓ ${Object.keys(patch).length} campo(s) guardado(s)`)
      }
    }
  }

  console.log("\n--- estado final ---")
  const after = await Experience.find({}).sort({ createdAt: 1 }).lean()
  for (const e of after as any[]) {
    console.log(`\n${e.company}`)
    for (const code of ["en", "fr", "it"] as const) {
      const d = e.translations?.[code]?.description || "(none)"
      const fb = d === e.description ? " [FALLBACK-ES]" : ""
      console.log(`  ${code}${fb}: ${d.slice(0, 80)}`)
    }
  }
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

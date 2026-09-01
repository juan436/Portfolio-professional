/**
 * Inserta los testimonios reales de Workana (curados a mano, 2026-09-01).
 * Idempotente: upsert por `author`, no duplica si se corre de nuevo.
 * Recibe: `MONGODB_URI` del env (local o prod-en-el-contenedor).
 * NO va en el dump: `testimonials` se deja fuera de export-content-dump.mjs para
 * no borrar los que lleguen por el form público de prod en un re-import.
 *
 * Uso local:  node scripts/seed-workana-testimonials.mjs
 * Uso prod:   docker run --rm --network proxy -v "$PWD":/w -w /w --env-file .env \
 *               node:22-alpine sh -lc 'corepack enable && corepack prepare pnpm@10.33.0 --activate \
 *               && pnpm install --frozen-lockfile --silent && node scripts/seed-workana-testimonials.mjs'
 */
import { MongoClient, ObjectId } from "mongodb"

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolioNew"

const now = new Date()
const at = (iso) => new Date(iso)

const P_GESTION_COMPRAS = new ObjectId("6a86bcd8e1ffef44cab6f592")
const P_AUDITORIA = new ObjectId("6a86bcd8e1ffef44cab6f59e")

const TESTIMONIALS = [
  {
    author: "Luis Felipe Tep Ek",
    role: "Cliente en Workana",
    content:
      "Cuando tienes tantas ofertas para un proyecto puede ser abrumador: quieres a alguien que entienda tus ganas de que sea extraordinario. Desde su perfil decían que Juan iba más allá de lo común, y al trabajar con él comprobé que era cierto. Busca que el trabajo sea rápido, eficiente y elegante, es atento a lo que quieres ver realizado y se esfuerza por sobrepasar tus expectativas. Quiero seguir trabajando con él.",
    type: "resultado",
    rating: 5,
    status: "approved",
    links: [{ type: "proyecto", ref: P_GESTION_COMPRAS }],
    suggestedMetrics: [],
    createdAt: at("2025-11-01T00:00:00Z"),
  },
  {
    author: "Víctor Antonio Ambrosio Juárez",
    role: "Cliente en Workana",
    content:
      "Excelente experiencia con Juan en el desarrollo de nuestro módulo de auditoría. Desde el inicio demostró un conocimiento profundo de los requerimientos: generación automática de papeles de trabajo, seguimiento de procedimientos y cumplimiento normativo. Integró análisis de riesgos y automatizó las cédulas analíticas y sumarias. Comunicación fluida, entregables a tiempo. Ahora procesamos las auditorías con mucha más eficiencia y trazabilidad.",
    type: "resultado",
    rating: 5,
    status: "approved",
    links: [{ type: "proyecto", ref: P_AUDITORIA }],
    suggestedMetrics: [],
    createdAt: at("2025-09-01T00:00:00Z"),
  },
  {
    author: "Carlos Jiménez",
    role: "Cliente en Workana",
    content:
      "Juan ha demostrado ser una persona altamente proactiva, responsable y con gran iniciativa. Su capacidad para anticiparse a las necesidades del proyecto y gestionarlo de manera eficiente es realmente destacable. Además, siempre mantiene una comunicación clara y constante, lo que garantiza un avance continuo y ordenado. ¡Un verdadero ejemplo de compromiso y excelencia!",
    type: "personal",
    rating: 5,
    status: "approved",
    links: [],
    suggestedMetrics: [],
    createdAt: at("2025-09-15T00:00:00Z"),
  },
  {
    author: "Lía Ezter Avilez Reyes",
    role: "Cliente en Workana",
    content: "Un excelente colaborador. Entrega los trabajos con anticipación, con resultados eficientes y de calidad.",
    type: "personal",
    rating: 5,
    status: "approved",
    links: [],
    suggestedMetrics: [],
    createdAt: at("2025-09-10T00:00:00Z"),
  },
]

const client = new MongoClient(URI)
await client.connect()
const col = client.db().collection("testimonials")

for (const t of TESTIMONIALS) {
  const r = await col.updateOne(
    { author: t.author },
    { $set: { ...t, updatedAt: now }, $setOnInsert: { __v: 0 } },
    { upsert: true },
  )
  console.log(`  ${t.author}: ${r.upsertedCount ? "insertado" : "actualizado"}`)
}

const total = await col.countDocuments()
console.log(`\ntestimonials en ${client.db().databaseName}: ${total}`)
await client.close()

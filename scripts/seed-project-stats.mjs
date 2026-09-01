/**
 * Carga las métricas de proyecto (`ProjectStats`) — estimadas a partir de lo que
 * hace cada proyecto (vault juan-villegas-ing), a validar con los clientes.
 * Idempotente: upsert por `link.ref`, no duplica si se corre de nuevo.
 * Recibe: `MONGODB_URI` del env (local por defecto).
 * NO va en el dump: `projectstats` se deja fuera de export-content-dump.mjs
 * (misma razón que `testimonials` — datos que también se cargan por Admin).
 *
 * Las métricas con `statType` suman al total acumulado del home:
 *   HOURS_SAVED (aditivo)  → varios proyectos suman
 *   PROCESS_ACCELERATION / AUTONOMOUS_OPERATION → UN solo proyecto cada una
 *     (el summary del home SUMA la parte numérica; multiplicar/promediar rompería).
 *
 * Uso local:  node scripts/seed-project-stats.mjs
 * Uso prod:   docker run --rm --network proxy -v "$PWD":/w -w /w --env-file .env \
 *               node:22-alpine sh -lc 'corepack enable && corepack prepare pnpm@10.33.0 --activate \
 *               && pnpm install --frozen-lockfile --silent && node scripts/seed-project-stats.mjs'
 */
import { MongoClient, ObjectId } from "mongodb"

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolioNew"

const oid = (h) => new ObjectId(h)

const STATS = [
  {
    ref: oid("6a86bcd8e1ffef44cab6f592"),
    metrics: [
      { label: "Horas administrativas ahorradas al mes", value: "80 h", statType: "HOURS_SAVED" },
      { label: "Generación y envío de un pedido", value: "10x más rápido", statType: "PROCESS_ACCELERATION" },
      { label: "Pedidos duplicados entre sucursales", value: "0" },
      { label: "Trazabilidad de pedidos (creado → recibido → reportado)", value: "100%" },
    ],
  },
  {
    ref: oid("6a86bcd8e1ffef44cab6f5ba"),
    metrics: [
      { label: "Horas/mes ahorradas en seguimiento de equipos y garantías", value: "25 h", statType: "HOURS_SAVED" },
      { label: "Cobertura", value: "13 países · 33 especialidades" },
      { label: "Validación de pagos con comprobante y fecha", value: "100% trazable" },
    ],
  },
  {
    ref: oid("6a86bcd8e1ffef44cab6f5c8"),
    metrics: [
      { label: "Facturas procesadas sin intervención manual", value: "100%", statType: "AUTONOMOUS_OPERATION" },
      { label: "Horas/mes ahorradas en tipeo de facturas", value: "50 h", statType: "HOURS_SAVED" },
      { label: "Formatos de factura soportados", value: "8" },
      { label: "Incoherencias fiscales de origen detectadas antes de emitir", value: "100%" },
    ],
  },
  {
    ref: oid("6a86bcd8e1ffef44cab6f5b3"),
    metrics: [
      { label: "Personas gestionando la misma boda", value: "hasta 3" },
      { label: "Áreas en un solo lugar", value: "6" },
      { label: "Acceso compartido idéntico (dueño + colaboradores)", value: "Sí" },
    ],
  },
]

const now = new Date()
const client = new MongoClient(URI)
await client.connect()
const col = client.db().collection("projectstats")

for (const s of STATS) {
  const doc = { link: { type: "proyecto", ref: s.ref }, metrics: s.metrics, updatedAt: now }
  const r = await col.updateOne(
    { "link.ref": s.ref },
    { $set: doc, $setOnInsert: { createdAt: now, __v: 0 } },
    { upsert: true },
  )
  console.log(`  ${s.ref.toString()}: ${r.upsertedCount ? "insertado" : "actualizado"} (${s.metrics.length} métricas)`)
}

const total = await col.countDocuments()
console.log(`\nprojectstats en ${client.db().databaseName}: ${total}`)
await client.close()

import { unstable_cache } from "next/cache"
import dbConnect from "@/lib/db/conection"
import Certificate from "@/models/certificate.model"
import { buildSafe } from "@/lib/data/build-safe"

/**
 * Lectura server-only de certificaciones, directo a Mongo.
 * Recibe: `getCertificateById(id)` / `getCertificateBySlug(slug)` / `getCertificatesList()`.
 * Produce: la(s) certificación(es) plana(s) (o `null` si no hay match).
 * Cacheadas con `unstable_cache` (tag "certificates", invalidado desde las
 * Server Actions del Admin con `revalidateTag`).
 */
export async function getCertificateById(id: string) {
  await dbConnect()
  try {
    const certificate = await Certificate.findById(id).lean()
    return certificate ? JSON.parse(JSON.stringify(certificate)) : null
  } catch {
    return null
  }
}

export const getCertificateBySlug = unstable_cache(
  (slug: string) =>
    buildSafe(async () => {
      await dbConnect()
      const certificate = await Certificate.findOne({ slug }).lean()
      return certificate ? JSON.parse(JSON.stringify(certificate)) : null
    }, null),
  ["certificate-by-slug"],
  { tags: ["certificates"], revalidate: 3600 },
)

export const getCertificatesList = unstable_cache(
  () =>
    buildSafe(async () => {
      await dbConnect()
      const certificates = await Certificate.find().sort({ date: -1 }).lean()
      return JSON.parse(JSON.stringify(certificates))
    }, [] as any[]),
  ["certificates-list"],
  { tags: ["certificates"], revalidate: 3600 },
)

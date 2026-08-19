import dbConnect from "@/lib/db/conection"
import Certificate from "@/models/certificate.model"

export async function getCertificateById(id: string) {
  await dbConnect()
  try {
    const certificate = await Certificate.findById(id).lean()
    return certificate ? JSON.parse(JSON.stringify(certificate)) : null
  } catch {
    return null
  }
}

export async function getCertificateBySlug(slug: string) {
  await dbConnect()
  const certificate = await Certificate.findOne({ slug }).lean()
  return certificate ? JSON.parse(JSON.stringify(certificate)) : null
}

export async function getCertificatesList() {
  await dbConnect()
  const certificates = await Certificate.find().sort({ date: -1 }).lean()
  return JSON.parse(JSON.stringify(certificates))
}

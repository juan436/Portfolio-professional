"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db/conection"
import Certificate from "@/models/certificate.model"
import { verifyAdminToken } from "@/lib/auth/jwt"
import { slugify, uniqueSlug } from "@/lib/slug"

async function requireAdminSession() {
  const store = await cookies()
  const token = store.get("authToken")?.value
  const ok = await verifyAdminToken(token)
  if (!ok) throw new Error("No autorizado")
}

function revalidateCertificates(slug?: string) {
  revalidatePath("/certificates")
  if (slug) revalidatePath(`/certificates/${slug}`)
}

export async function createCertificateAction(data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const baseSlug = slugify(data.slug || data.title || "")
  const slug = await uniqueSlug(Certificate, baseSlug)

  const certificate = new Certificate({ ...data, slug })
  await certificate.save()
  revalidateCertificates(slug)

  return JSON.parse(JSON.stringify(certificate))
}

export async function updateCertificateAction(id: string, data: Record<string, any>) {
  await requireAdminSession()
  await dbConnect()

  const existing = await Certificate.findById(id)
  if (!existing) throw new Error("Certificado no encontrado")

  const oldSlug = existing.slug
  const patch: Record<string, any> = { ...data }
  if (typeof data.slug === "string" && data.slug.trim() !== "" && slugify(data.slug) !== existing.slug) {
    patch.slug = await uniqueSlug(Certificate, slugify(data.slug), id)
  } else {
    delete patch.slug
  }

  existing.set(patch)
  await existing.save()

  revalidateCertificates(oldSlug)
  if (existing.slug !== oldSlug) revalidateCertificates(existing.slug)

  return JSON.parse(JSON.stringify(existing))
}

export async function deleteCertificateAction(id: string, slug: string) {
  await requireAdminSession()
  await dbConnect()

  const deleted = await Certificate.findByIdAndDelete(id)
  if (!deleted) throw new Error("Certificado no encontrado")
  revalidateCertificates(slug)

  return true
}

import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/auth/jwt"

// Helpers compartidos entre Server Actions (lib/actions/*.ts). Vive FUERA de
// cualquier archivo "use server" a propósito: Next exige que todo lo
// exportado de un módulo "use server" sea una función async — mismo patrón
// que lib/actions/revalidation.ts.
export async function requireAdminSession() {
  const store = await cookies()
  const token = store.get("authToken")?.value
  const ok = await verifyAdminToken(token)
  if (!ok) throw new Error("No autorizado")
}

export function mergeTranslations(existing: any, incoming: any) {
  if (!incoming) return existing
  const merged: Record<string, any> = { ...(existing || {}) }
  for (const lang of Object.keys(incoming)) {
    merged[lang] = { ...(existing?.[lang] || {}), ...incoming[lang] }
  }
  return merged
}

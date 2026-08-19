import { jwtVerify } from "jose"

// Verificación de JWT compartida entre middleware.ts (rutas API) y las Server
// Actions de Admin (lib/actions/*.ts) — las Server Actions no pasan por el
// matcher del middleware, así que cada una tiene que verificar la sesión por
// su cuenta. Antes esta lógica vivía duplicada/inline solo en middleware.ts.
export async function verifyAdminToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY)
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

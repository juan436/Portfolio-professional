/**
 * Envuelve una lectura de Mongo para que NO reviente el build de Docker: el
 * build corre sin la red del compose → `server-mongodb` no resuelve →
 * `getaddrinfo ENOTFOUND`. Si la query falla, devuelve `fallback`.
 *
 * En runtime, con Mongo accesible, se comporta normal. Combinado con ISR
 * (`revalidate`), la página se prerenderea vacía en build y se regenera con
 * datos reales en la primera visita (y queda cacheada). Ver portfolio:
 * planes/force-dynamic-a-isr-2026-09-01.
 */
export async function buildSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[build-safe] lectura de Mongo falló, usando fallback:", (err as Error)?.message)
    }
    return fallback
  }
}

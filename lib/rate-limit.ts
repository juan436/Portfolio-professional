/**
 * Rate limiting en memoria, por IP — vale porque el contenedor corre un solo
 * proceso Node, sin réplicas (ver docker-compose.yml, sin deploy.replicas).
 * Si algún día se escala a más de un contenedor, esto deja de servir y hay
 * que pasar a un store compartido (Redis).
 * Recibe: `isRateLimited(key, limit, windowMs)`; `getClientIp(request)`.
 * Produce: `boolean` (si superó el límite) / la IP del cliente.
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [k, timestamps] of hits) {
      if (timestamps.every((t) => now - t > windowMs)) hits.delete(k);
    }
  }

  return false;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Rate limiter en memoria del proceso.
 *
 * NOTA: esto es una mitigación básica. No sobrevive a un restart del servidor
 * ni funciona con múltiples instancias/ réplicas corriendo en paralelo. Si el
 * proyecto escala a múltiples instancias, migrar esto a Redis o una tabla de
 * rate-limiting persistente.
 */

const buckets = new Map<string, number[]>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const windowStart = now - windowMs

  const timestamps = buckets.get(key) ?? []
  const validTimestamps = timestamps.filter((t) => t > windowStart)

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0] ?? now
    return { allowed: false, retryAfterMs: windowMs - (now - oldest) }
  }

  validTimestamps.push(now)
  buckets.set(key, validTimestamps)
  return { allowed: true }
}

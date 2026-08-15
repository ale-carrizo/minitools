const TZ_AR = 'America/Argentina/Buenos_Aires'

/**
 * Fecha de "hoy" en zona horaria Argentina, formato YYYY-MM-DD.
 * new Date().toISOString() siempre devuelve la fecha en UTC, sin importar
 * la zona horaria del servidor — entre las 21:00 y 23:59 hora Argentina
 * (UTC-3) ya es "mañana" en UTC, así que ese patrón corre la fecha por
 * defecto un día para adelante durante esas 3 horas. Usar esta función en
 * cualquier lugar que necesite "la fecha de hoy" para el negocio.
 */
export function todayAR(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ_AR })
}

/** Tiempo relativo tipo "hace 5 min" / "hace 3 h" / "hace 2 d". null → "Nunca". */
export function timeAgo(fecha: Date | string | null): string {
  if (!fecha) return 'Nunca'
  const ms = Date.now() - new Date(fecha).getTime()
  if (ms < 0) return 'Recién'
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'Ahora'
  if (min < 60) return `hace ${min} min`
  const hs = Math.floor(min / 60)
  if (hs < 24) return `hace ${hs} h`
  const dias = Math.floor(hs / 24)
  if (dias < 30) return `hace ${dias} d`
  const meses = Math.floor(dias / 30)
  return `hace ${meses} mes${meses > 1 ? 'es' : ''}`
}

/** Umbral usado en el admin para considerar a un usuario "en línea ahora". */
export const ONLINE_THRESHOLD_MIN = 5

export function isOnline(lastActiveAt: Date | string | null): boolean {
  if (!lastActiveAt) return false
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_THRESHOLD_MIN * 60 * 1000
}

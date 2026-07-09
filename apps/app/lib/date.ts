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

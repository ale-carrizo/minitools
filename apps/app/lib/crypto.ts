import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from 'crypto'

// Cifrado en reposo para datos sensibles (certificado y clave privada de ARCA).
// Requiere FACTURADOR_ENCRYPTION_KEY en el entorno — cualquier string, se deriva
// una clave AES-256 a partir de ella con scrypt (no hace falta que sea de 32 bytes).

function claveDerivada(): Buffer {
  const secreto = process.env.FACTURADOR_ENCRYPTION_KEY
  if (!secreto) throw new Error('Falta configurar FACTURADOR_ENCRYPTION_KEY en el entorno')
  return scryptSync(secreto, 'zimple-facturador-salt', 32)
}

export function encrypt(texto: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', claveDerivada(), iv)
  const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, cifrado]).toString('base64')
}

export function decrypt(valor: string): string {
  const buf = Buffer.from(valor, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const cifrado = buf.subarray(28)
  const decipher = createDecipheriv('aes-256-gcm', claveDerivada(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString('utf8')
}

/**
 * Compara dos strings en tiempo constante — usar para cualquier secreto
 * (firmas de webhook, tokens de cron, etc). `a === b` filtra por timing
 * cuánto del string coincide, lo que en teoría permite reconstruir el
 * secreto carácter a carácter.
 */
export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // timingSafeEqual exige buffers del mismo largo — si difieren, ya sabemos
  // que no matchean, pero igual comparamos contra un buffer del mismo largo
  // que bufA para no devolver antes de tiempo con una señal de timing distinta.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

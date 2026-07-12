// Verificación de "magic bytes" — confirma que el contenido real de un archivo
// coincide con el MIME type declarado, en vez de confiar en la extensión/header
// del upload. Isomórfico (sin 'use client'/'use server') para poder usarse tanto
// en componentes cliente (con el ArrayBuffer de un File) como en server actions
// (decodificando un data-URL base64).

export function firmaCoincide(head: Uint8Array, mime: string): boolean {
  switch (mime) {
    case 'image/jpeg':
      return head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF
    case 'image/png':
      return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47 &&
             head[4] === 0x0D && head[5] === 0x0A && head[6] === 0x1A && head[7] === 0x0A
    case 'image/webp':
      return head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
             head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
    case 'application/pdf':
      return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46
    default:
      return false
  }
}

/** Solo para server code (usa Buffer/Node). Verifica un data-URL base64. */
export function verificarFirmaBase64(dataUrl: string, mime: string): boolean {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return false
  const buffer = Buffer.from(match[2].slice(0, 24), 'base64')
  return firmaCoincide(buffer, mime)
}

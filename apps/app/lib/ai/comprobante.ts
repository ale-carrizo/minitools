/**
 * lib/ai/comprobante.ts
 *
 * SLOT DE IA — Procesamiento de comprobantes de transferencia
 * ─────────────────────────────────────────────────────────────
 * Para cambiar de proveedor (Claude → OpenAI → Gemini) solo modificás
 * este archivo. El resto del código no cambia.
 *
 * Para activar un proveedor:
 *   1. Agregá las env vars correspondientes
 *   2. Descomentar la función del proveedor elegido
 *   3. Apuntar DEFAULT_PROVIDER a ese proveedor
 */

import type { ComprobanteIAResult } from '@/types/caja'
import { todayAR } from '@/lib/date'

const DEFAULT_PROVIDER = process.env.AI_PROVIDER ?? 'stub'

const SYSTEM_PROMPT = `
Sos un extractor de datos de comprobantes de transferencia bancaria argentina.
Analizás la imagen o PDF y devolvés ÚNICAMENTE un objeto JSON con esta estructura:
{
  "monto": number | null,
  "fecha": "YYYY-MM-DD" | null,
  "hora": "HH:MM" | null,
  "emisor_nombre": string | null,
  "emisor_banco": string | null,
  "referencia": string | null,
  "tipo": "transferencia" | "deposito" | "pago_qr" | "otro" | null,
  "confidence": number (0 a 1)
}
Reglas:
- monto: solo el número, sin símbolo de moneda, sin puntos de miles
- Si no encontrás un campo, devolvé null
- confidence: qué tan seguro estás de los datos extraídos (0=nada, 1=certeza total)
- No incluyas ningún texto fuera del JSON
`.trim()

interface IAProvider {
  name: string
  model: string
  processImage: (imageBase64: string, mimeType: string) => Promise<ComprobanteIAResult>
}

// ── PROVEEDOR: Stub (desarrollo/testing) ──────────────────────────────────────
const stubProvider: IAProvider = {
  name:  'stub',
  model: 'stub-v1',
  async processImage(_imageBase64, _mimeType) {
    await new Promise(r => setTimeout(r, 800))
    const raw = {
      monto:         142000,
      fecha:         todayAR(),
      hora:          new Date().toTimeString().slice(0, 5),
      emisor_nombre: 'Ana Martínez',
      emisor_banco:  'Banco Nación',
      referencia:    'CVU 0000003100094693671220',
      tipo:          'transferencia' as const,
      confidence:    0.95,
    }
    return { ...raw, raw }
  }
}

// ── PROVEEDOR: Claude (Anthropic) ─────────────────────────────────────────────
// ENV: ANTHROPIC_API_KEY
/*
const claudeProvider: IAProvider = {
  name:  'claude',
  model: 'claude-sonnet-4-20250514',
  async processImage(imageBase64, mimeType) {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [{
          type: 'image',
          source: { type: 'base64', media_type: mimeType as any, data: imageBase64 }
        }, {
          type: 'text',
          text: 'Extraé los datos de este comprobante de transferencia.'
        }]
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const raw  = JSON.parse(text)
    return { ...raw, raw }
  }
}
*/

// ── PROVEEDOR: OpenAI GPT-4o ──────────────────────────────────────────────────
// ENV: OPENAI_API_KEY
/*
const openaiProvider: IAProvider = {
  name:  'openai',
  model: 'gpt-4o',
  async processImage(imageBase64, mimeType) {
    const OpenAI = (await import('openai')).default
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 512,
      messages: [{
        role: 'system', content: SYSTEM_PROMPT
      }, {
        role: 'user',
        content: [{
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${imageBase64}` }
        }, {
          type: 'text',
          text: 'Extraé los datos de este comprobante de transferencia.'
        }]
      }]
    })

    const text = response.choices[0]?.message?.content ?? '{}'
    const raw  = JSON.parse(text)
    return { ...raw, raw }
  }
}
*/

// ── Registry ──────────────────────────────────────────────────────────────────
const PROVIDERS: Record<string, IAProvider> = {
  stub: stubProvider,
  // claude: claudeProvider,
  // openai: openaiProvider,
}

export async function procesarComprobante(
  imageBase64: string,
  mimeType: string
): Promise<ComprobanteIAResult & { provider: string; model: string }> {
  const provider = PROVIDERS[DEFAULT_PROVIDER] ?? stubProvider
  const result   = await provider.processImage(imageBase64, mimeType)
  return { ...result, provider: provider.name, model: provider.model }
}

// ── Planes fijos (ARS) — deben coincidir con apps/web/app/page.tsx#pricing ────
// TC de referencia usado para fijar estos montos: 1550 (no se recalcula en vivo).

export type PlanSlug = 'UNA_HERRAMIENTA' | 'STARTER' | 'PRO' | 'FULL'

export interface PlanDef {
  slug: PlanSlug
  label: string
  priceARS: number
  maxApps: number      // tope de apps activables simultáneamente
  savingsLabel?: string
}

export const PLANS: Record<PlanSlug, PlanDef> = {
  UNA_HERRAMIENTA: { slug: 'UNA_HERRAMIENTA', label: 'Una herramienta', priceARS: 6000,  maxApps: 1 },
  STARTER:         { slug: 'STARTER',         label: 'Starter',         priceARS: 12000, maxApps: 3,  savingsLabel: 'Ahorrás 33%' },
  PRO:             { slug: 'PRO',             label: 'Pro',             priceARS: 23000, maxApps: 6,  savingsLabel: 'Ahorrás 37%' },
  FULL:            { slug: 'FULL',            label: 'Full',            priceARS: 30000, maxApps: 12, savingsLabel: 'Ahorrás 44%' },
}

export const PLAN_ORDER: PlanSlug[] = ['UNA_HERRAMIENTA', 'STARTER', 'PRO', 'FULL']

/** Plan más barato que cubre `count` apps seleccionadas. */
export function planForAppCount(count: number): PlanDef {
  const slug = PLAN_ORDER.find(s => count <= PLANS[s].maxApps) ?? 'FULL'
  return PLANS[slug]
}

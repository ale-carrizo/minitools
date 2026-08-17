import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { PLANS, type PlanSlug } from "@/lib/plans";

// ─── Client singleton ────────────────────────────────────────────────────────
// Keys se cargan desde env vars en Railway.
// Mientras no estén configuradas, las llamadas a MP fallarán con un error claro.

function getMpClient() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado.");
  }
  return new MercadoPagoConfig({
    accessToken: token,
    options: { timeout: 10000 },
  });
}

// ─── Crear suscripción (preapproval) con monto dinámico según el plan ────────
// No usa preapproval_plan_id: el monto sale directo del plan elegido en
// lib/plans.ts, así no hace falta crear/mantener 4 planes en el dashboard de MP.
// `startDate` difiere el primer cobro (fin del trial) — MP igual pide la
// tarjeta ahora, pero no cobra nada hasta esa fecha.
export async function createSubscription({
  planSlug,
  userEmail,
  userId,
  backUrl,
  startDate,
}: {
  planSlug: PlanSlug;
  userEmail: string;
  userId: string;
  backUrl: string;
  startDate: Date;
}) {
  const client = getMpClient();
  const preApproval = new PreApproval(client);
  const plan = PLANS[planSlug];

  const response = await preApproval.create({
    body: {
      reason: `Zimple Tools — Plan ${plan.label}`,
      payer_email: userEmail,
      external_reference: userId,
      back_url: backUrl,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.priceARS,
        currency_id: "ARS",
        start_date: startDate.toISOString(),
      },
    },
  });

  return response;
}

// ─── Cancelar suscripción ────────────────────────────────────────────────────
export async function cancelSubscription(preapprovalId: string) {
  const client = getMpClient();
  const preApproval = new PreApproval(client);

  return preApproval.update({
    id: preapprovalId,
    body: { status: "cancelled" },
  });
}

// ─── Pausar suscripción ──────────────────────────────────────────────────────
export async function pauseSubscription(preapprovalId: string) {
  const client = getMpClient();
  const preApproval = new PreApproval(client);

  return preApproval.update({
    id: preapprovalId,
    body: { status: "paused" },
  });
}

// ─── Reactivar suscripción ───────────────────────────────────────────────────
export async function reactivateSubscription(preapprovalId: string) {
  const client = getMpClient();
  const preApproval = new PreApproval(client);

  return preApproval.update({
    id: preapprovalId,
    body: { status: "authorized" },
  });
}

// ─── Obtener estado de una suscripción ───────────────────────────────────────
export async function getSubscription(preapprovalId: string) {
  const client = getMpClient();
  const preApproval = new PreApproval(client);
  return preApproval.get({ id: preapprovalId });
}

// ─── Verificar signature del webhook ─────────────────────────────────────────
export function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  body: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !xSignature || !xRequestId) return false;

  try {
    const crypto = require("crypto");
    const [tsPart, v1Part] = xSignature.split(",");
    const ts = tsPart?.split("=")[1];
    const v1 = v1Part?.split("=")[1];
    if (!ts || !v1) return false;

    const manifest = `id:${xRequestId};request-id:${xRequestId};ts:${ts};`;
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    return hmac === v1;
  } catch {
    return false;
  }
}

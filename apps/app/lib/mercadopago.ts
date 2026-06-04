import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment } from "mercadopago";

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

// ─── Plan IDs (se crean una vez en el dashboard de MP y se guardan en env) ───
export const MP_PLANS = {
  MONTHLY: process.env.MP_PLAN_MONTHLY_ID ?? "",
  ANNUAL: process.env.MP_PLAN_ANNUAL_ID ?? "",
} as const;

// ─── Precios (ARS) ───────────────────────────────────────────────────────────
export const PRICES = {
  MONTHLY: { amount: 9900, label: "$9.900/mes", period: "Mensual" },
  ANNUAL: { amount: 79200, label: "$79.200/año ($6.600/mes)", period: "Anual" },
} as const;

// ─── Crear suscripción (preapproval) para un usuario ─────────────────────────
export async function createSubscription({
  planType,
  userEmail,
  userId,
  backUrl,
}: {
  planType: "MONTHLY" | "ANNUAL";
  userEmail: string;
  userId: string;
  backUrl: string;
}) {
  const client = getMpClient();
  const preApproval = new PreApproval(client);

  const planId = MP_PLANS[planType];
  if (!planId) {
    throw new Error(`MP_PLAN_${planType}_ID no está configurado.`);
  }

  const response = await preApproval.create({
    body: {
      preapproval_plan_id: planId,
      payer_email: userEmail,
      external_reference: userId,
      back_url: backUrl,
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

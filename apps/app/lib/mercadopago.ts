import { MercadoPagoConfig, PreApproval, WebhookSignatureValidator } from "mercadopago";
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

// Tolerancia contra reintentos/replay: un webhook con un `ts` más viejo que
// esto se rechaza, aunque la firma sea válida (pudo haber sido capturado y
// reenviado). 5 min cubre reintentos legítimos de MP con margen de sobra.
const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

// ─── Verificar signature del webhook ─────────────────────────────────────────
// Usa el validador oficial del SDK en vez de recomputar el HMAC a mano: la
// versión anterior armaba el manifest como `id:{x-request-id};request-id:
// {x-request-id}` — pero el campo `id:` del manifest de MP tiene que salir
// del query param `data.id` de la URL del webhook, no del header
// x-request-id (son dos valores distintos). El validador oficial ya hace
// esto bien, además de la comparación en tiempo constante y el chequeo de
// antigüedad del timestamp.
export function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string | null
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !xSignature || !xRequestId) return false;

  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret,
      toleranceSeconds: WEBHOOK_TOLERANCE_SECONDS,
    });
    return true;
  } catch {
    return false;
  }
}

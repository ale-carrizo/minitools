import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, getSubscription } from "@/lib/mercadopago";

// Mapa de estados MP → estados internos
const MP_STATUS_MAP: Record<string, "ACTIVE" | "SUSPENDED" | "CANCELED" | "TRIAL"> = {
  authorized: "ACTIVE",
  paused: "SUSPENDED",
  cancelled: "CANCELED",
  pending: "TRIAL",
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  // Verificación de firma es obligatoria. Sin MP_WEBHOOK_SECRET rechazamos todo.
  if (!process.env.MP_WEBHOOK_SECRET) {
    console.error("[Webhook] MP_WEBHOOK_SECRET no está configurado — request rechazado");
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  const valid = verifyWebhookSignature(xSignature, xRequestId, body);
  if (!valid) {
    console.warn("[Webhook] Firma inválida — request rechazado");
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let event: { type: string; data: { id: string } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  console.log("[Webhook MP]", event.type, event.data?.id);

  // Solo procesamos eventos de preapproval (suscripciones)
  if (event.type !== "preapproval") {
    return NextResponse.json({ ok: true });
  }

  const preapprovalId = event.data?.id;
  if (!preapprovalId) {
    return NextResponse.json({ error: "ID faltante" }, { status: 400 });
  }

  try {
    // Obtener detalle actualizado desde MP
    const mpSub = await getSubscription(preapprovalId);

    const internalStatus = MP_STATUS_MAP[mpSub.status ?? ""] ?? "TRIAL";
    const externalRef = mpSub.external_reference; // userId

    if (!externalRef) {
      console.warn("[Webhook] Sin external_reference en preapproval", preapprovalId);
      return NextResponse.json({ ok: true });
    }

    // Actualizar suscripción en DB
    await prisma.subscription.updateMany({
      where: { userId: externalRef },
      data: {
        status: internalStatus,
        mpPreapprovalId: preapprovalId,
        ...(internalStatus === "ACTIVE" && { startDate: new Date() }),
        ...(internalStatus === "CANCELED" && { endDate: new Date() }),
      },
    });

    // Si se activó, crear factura (con idempotencia por preapprovalId)
    if (internalStatus === "ACTIVE" && mpSub.auto_recurring?.transaction_amount) {
      const sub = await prisma.subscription.findUnique({
        where: { userId: externalRef },
      });
      if (sub) {
        // mpPreapprovalId identifica a la SUSCRIPCIÓN, no al cobro puntual — es el
        // mismo en cada renovación mensual. Deduplicar solo por ese id bloquearía
        // toda factura después de la primera. En cambio, tratamos como reintento
        // del mismo webhook únicamente si ya se creó una factura para esta misma
        // suscripción en las últimas horas (una renovación real llega ~30 días
        // después, muy por fuera de esta ventana).
        const ventanaReintento = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const existing = await prisma.invoice.findFirst({
          where: {
            subscriptionId: sub.id,
            mpPreapprovalId: preapprovalId,
            createdAt: { gte: ventanaReintento },
          },
        });
        if (!existing) {
          await prisma.invoice.create({
            data: {
              subscriptionId: sub.id,
              mpPreapprovalId: preapprovalId,
              amount: mpSub.auto_recurring.transaction_amount,
              currency: mpSub.auto_recurring.currency_id ?? "ARS",
              status: "paid",
              dueDate: new Date(),
              paidAt: new Date(),
              description: `Suscripción ${sub.plan === "ANNUAL" ? "Anual" : "Mensual"} — Zimple Tools`,
            },
          });
        }
      }
    }

    // Sincronizar suspensión de usuario si la suscripción se cancela
    if (internalStatus === "CANCELED") {
      await prisma.user.update({
        where: { id: externalRef },
        data: { suspended: false }, // Cancelado ≠ suspendido, solo sin acceso
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Webhook Error]", error?.message ?? error);
    // Devolver 200 para que MP no reintente indefinidamente
    return NextResponse.json({ ok: true });
  }
}

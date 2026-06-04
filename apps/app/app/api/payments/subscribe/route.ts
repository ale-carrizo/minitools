import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSubscription, PRICES } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { planType } = await req.json() as { planType: "MONTHLY" | "ANNUAL" };
  if (!["MONTHLY", "ANNUAL"].includes(planType)) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  // Verificar si ya tiene suscripción activa
  const existing = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (existing?.status === "ACTIVE") {
    return NextResponse.json({ error: "Ya tenés una suscripción activa" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "https://app.zimple.tools";

  try {
    const mpResponse = await createSubscription({
      planType,
      userEmail: session.user.email!,
      userId: session.user.id,
      backUrl: `${baseUrl}/dashboard?payment=success`,
    });

    // Crear o actualizar suscripción en DB como TRIAL hasta que MP confirme
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        plan: planType,
        status: "TRIAL",
        priceMonthly: planType === "ANNUAL"
          ? PRICES.ANNUAL.amount / 12
          : PRICES.MONTHLY.amount,
        mpPreapprovalId: mpResponse.id ?? null,
        mpPayerEmail: session.user.email,
        mpPlanId: process.env[`MP_PLAN_${planType}_ID`] ?? null,
      },
      update: {
        plan: planType,
        status: "TRIAL",
        mpPreapprovalId: mpResponse.id ?? null,
        mpPayerEmail: session.user.email,
      },
    });

    return NextResponse.json({
      checkoutUrl: mpResponse.init_point,
      subscriptionId: mpResponse.id,
    });
  } catch (error: any) {
    console.error("[MP Subscribe Error]", error?.message ?? error);
    return NextResponse.json(
      { error: error?.message ?? "Error al crear la suscripción" },
      { status: 500 }
    );
  }
}

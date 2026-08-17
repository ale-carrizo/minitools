import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSubscription } from "@/lib/mercadopago";
import { PLANS, type PlanSlug } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { planSlug } = (await req.json()) as { planSlug: PlanSlug };
  if (!Object.keys(PLANS).includes(planSlug)) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  const existing = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (existing?.status === "ACTIVE" && existing.plan === planSlug) {
    return NextResponse.json({ error: "Ya tenés este plan activo" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "https://app.zimple.tools";
  const plan = PLANS[planSlug];

  try {
    // Cambio/alta de plan fuera del onboarding: se cobra ya, sin trial.
    const mpResponse = await createSubscription({
      planSlug,
      userEmail: session.user.email,
      userId: session.user.id,
      backUrl: `${baseUrl}/dashboard?payment=success`,
      startDate: new Date(),
    });

    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        plan: planSlug,
        status: "TRIAL", // pasa a ACTIVE cuando el webhook confirme
        priceMonthly: plan.priceARS,
        currency: "ARS",
        mpPreapprovalId: mpResponse.id ?? null,
        mpPayerEmail: session.user.email,
        paymentMethod: "mercadopago",
      },
      update: {
        plan: planSlug,
        priceMonthly: plan.priceARS,
        currency: "ARS",
        status: "TRIAL",
        mpPreapprovalId: mpResponse.id ?? null,
        mpPayerEmail: session.user.email,
        paymentMethod: "mercadopago",
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

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cancelSubscription } from "@/lib/mercadopago";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!sub || !sub.mpPreapprovalId) {
    return NextResponse.json({ error: "Sin suscripción activa" }, { status: 404 });
  }

  try {
    await cancelSubscription(sub.mpPreapprovalId);

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "CANCELED", endDate: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Cancel Error]", error?.message ?? error);
    return NextResponse.json(
      { error: error?.message ?? "Error al cancelar" },
      { status: 500 }
    );
  }
}

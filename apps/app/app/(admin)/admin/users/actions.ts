"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function suspendUser(userId: string) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { suspended: true, suspendedAt: new Date() },
  });
  // Also suspend their active subscription
  await prisma.subscription.updateMany({
    where: { userId, status: { in: ["ACTIVE", "TRIAL"] } },
    data: { status: "SUSPENDED" },
  });
  revalidatePath("/admin/users");
}

export async function unsuspendUser(userId: string) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { suspended: false, suspendedAt: null },
  });
  // Reactivate subscription
  await prisma.subscription.updateMany({
    where: { userId, status: "SUSPENDED" },
    data: { status: "ACTIVE" },
  });
  revalidatePath("/admin/users");
}

export async function makeAdmin(userId: string) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  });
  revalidatePath("/admin/users");
}

export async function removeAdmin(userId: string) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { role: "USER" },
  });
  revalidatePath("/admin/users");
}

export type PromoteState = { error?: string; success?: string };

export async function promoteByEmail(
  _prev: PromoteState,
  formData: FormData
): Promise<PromoteState> {
  await requireAdmin();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Ingresá un email." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: `No existe ningún usuario con el email ${email}.` };
  if (user.role === "ADMIN") return { error: `${email} ya es administrador.` };

  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  revalidatePath("/admin/users");
  return { success: `${email} ahora es administrador.` };
}

export type CreateUserState = {
  error?: string;
  success?: string;
  email?: string;
  tempPassword?: string;
};

export async function createUserManual(
  _prev: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  let email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = (formData.get("role") as string) === "ADMIN" ? "ADMIN" : "USER";
  const providedPassword = formData.get("password") as string;

  if (!name || !email) {
    return { error: "Nombre y email son obligatorios." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "El email no es válido." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: `Ya existe una cuenta con el email ${email}.` };
  }

  const tempPassword = providedPassword?.trim() || randomBytes(8).toString("hex");
  if (tempPassword.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  const hashed = await bcrypt.hash(tempPassword, 12);

  await prisma.user.create({
    data: { name, email, password: hashed, role },
  });

  revalidatePath("/admin/users");
  return {
    success: `Usuario creado correctamente. Compartí esta contraseña temporal con ${name}.`,
    email,
    tempPassword,
  };
}

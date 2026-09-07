"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { createPromoterSchema } from "@/lib/validation";

export type CreatePromoterState = { error?: string; success?: boolean };

export async function createPromoterAction(
  _prevState: CreatePromoterState,
  formData: FormData
): Promise<CreatePromoterState> {
  await requireRole("ADMIN");

  const parsed = createPromoterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") === "ADMIN" ? "ADMIN" : "PROMOTER",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
  });

  revalidatePath("/dashboard/admin/promoters");
  return { success: true };
}

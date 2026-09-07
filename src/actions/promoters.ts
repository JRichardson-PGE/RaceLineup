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
    loginType: formData.get("loginType"),
    email: formData.get("email") ?? undefined,
    username: formData.get("username") ?? undefined,
    password: formData.get("password"),
    role: formData.get("role") === "ADMIN" ? "ADMIN" : "PROMOTER",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const email = parsed.data.loginType === "email" ? parsed.data.email! : null;
  const username =
    parsed.data.loginType === "username" ? parsed.data.username! : null;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : []),
      ],
    },
  });
  if (existing) {
    return {
      error:
        parsed.data.loginType === "email"
          ? "An account with that email already exists."
          : "That username is already taken.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      username,
      passwordHash,
      role: parsed.data.role,
    },
  });

  revalidatePath("/dashboard/admin/promoters");
  return { success: true };
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const userId = String(formData.get("userId") ?? "");

  if (userId === admin.sub) {
    return;
  }

  try {
    await prisma.$transaction([
      // Clear the self-referencing "current race" pointer on this user's
      // events first, so deleting the user (which cascades to their events
      // and races) doesn't hit both sides of that circular reference at once.
      prisma.event.updateMany({
        where: { promoterId: userId },
        data: { currentRaceId: null },
      }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return; // already deleted
    }
    throw error;
  }

  revalidatePath("/dashboard/admin/promoters");
  revalidatePath("/dashboard");
}

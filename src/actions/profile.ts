"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema, updateEmailSchema } from "@/lib/validation";

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.sub },
  });

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash
  );
  if (!valid) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}

export type UpdateEmailState = { error?: string; success?: boolean };

export async function updateEmailAction(
  _prevState: UpdateEmailState,
  formData: FormData
): Promise<UpdateEmailState> {
  const session = await requireUser();

  const parsed = updateEmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing && existing.id !== session.sub) {
    return { error: "An account with that email already exists." };
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: { email: parsed.data.email },
  });

  revalidatePath("/dashboard/profile");
  return { success: true };
}

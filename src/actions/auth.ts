"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionCookie, destroySessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter your email or username, and password." };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: parsed.data.identifier },
        { username: parsed.data.identifier },
      ],
    },
  });

  if (!user) {
    return { error: "Invalid login or password." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid login or password." };
  }

  await createSessionCookie({
    sub: user.id,
    login: user.email ?? user.username ?? user.id,
    name: user.name,
    role: user.role,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySessionCookie();
  redirect("/login");
}

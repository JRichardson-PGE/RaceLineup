import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { UpdateEmailForm } from "@/components/UpdateEmailForm";

export default async function ProfilePage() {
  const session = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.sub },
    select: { name: true, email: true, username: true, role: true },
  });

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
        <p className="text-sm text-gray-500">
          {user.name} &middot; {user.role.toLowerCase()}
          {user.username ? ` · @${user.username}` : ""}
        </p>
      </div>

      <UpdateEmailForm currentEmail={user.email} />
      <ChangePasswordForm />
    </>
  );
}

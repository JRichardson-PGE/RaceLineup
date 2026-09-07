import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatePromoterForm } from "@/components/CreatePromoterForm";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { deleteUserAction } from "@/actions/promoters";

export default async function PromotersPage() {
  const admin = await requireRole("ADMIN");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, username: true, role: true },
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Promoter accounts</h1>

      <CreatePromoterForm />

      <ul className="flex flex-col gap-2">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{u.name}</p>
              <p className="text-sm text-gray-500">
                {u.email ?? `@${u.username}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-600">
                {u.role.toLowerCase()}
              </span>
              {u.id !== admin.sub && (
                <form action={deleteUserAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Delete ${u.name}? This also permanently deletes every event and lineup they own. This cannot be undone.`}
                    className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

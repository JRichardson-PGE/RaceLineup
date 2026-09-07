import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 p-4">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link href="/dashboard" className="text-gray-900">
              RaceLineup
            </Link>
            {user.role === "ADMIN" && (
              <Link
                href="/dashboard/admin/promoters"
                className="text-gray-600 hover:text-gray-900"
              >
                Promoters
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">
              {user.name} &middot; {user.role.toLowerCase()}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="font-medium text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4">
        {children}
      </main>
    </div>
  );
}

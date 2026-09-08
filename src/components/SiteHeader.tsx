import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

// The Promoter Playbook — how-to guide published as a Claude artifact.
const PROMOTER_PLAYBOOK_URL =
  "https://claude.ai/code/artifact/ce23078d-0592-4b55-b5a7-6b2878ff8167";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header
      id="site-header"
      className="sticky top-0 z-30 border-b border-gray-200 bg-white"
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 p-4">
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/events" className="text-gray-900">
            RaceLineup
          </Link>
          {session && (
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          )}
          {session && (
            <a
              href={PROMOTER_PLAYBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              How to Use
            </a>
          )}
          {session?.role === "ADMIN" && (
            <Link
              href="/dashboard/admin/promoters"
              className="text-gray-600 hover:text-gray-900"
            >
              Promoters
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <Link
                href="/dashboard/profile"
                className="text-gray-500 hover:text-gray-900"
              >
                {session.name} &middot; {session.role.toLowerCase()}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-gray-900 px-3 py-1.5 font-medium text-white hover:bg-gray-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

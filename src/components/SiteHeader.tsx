import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { MobileMenu } from "@/components/MobileMenu";

export async function SiteHeader() {
  const session = await getSession();

  // Kept out of the mobile dropdown and always visible — it's the page
  // promoters actually work from, so it shouldn't take an extra tap to see.
  const dashboardLink = session && (
    <Link
      href="/dashboard"
      className="font-semibold text-gray-900 hover:text-gray-600"
    >
      Dashboard
    </Link>
  );

  const otherNavLinks = (
    <>
      {session && (
        <Link
          href="/guide"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          How to Use
        </Link>
      )}
      {session?.role === "ADMIN" && (
        <Link
          href="/dashboard/admin/promoters"
          className="text-gray-600 hover:text-gray-900"
        >
          Promoters
        </Link>
      )}
    </>
  );

  const accountArea = session ? (
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
  );

  return (
    <header
      id="site-header"
      className="sticky top-0 z-30 border-b border-gray-200 bg-white"
    >
      <div className="relative mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/events" className="text-sm font-medium text-gray-900">
            RaceLineup
          </Link>
          <nav className="hidden flex-wrap items-center gap-4 text-sm font-medium sm:flex">
            {dashboardLink}
            {otherNavLinks}
          </nav>
          <div className="hidden items-center gap-3 text-sm sm:flex">
            {accountArea}
          </div>
          <div className="flex items-center gap-3 text-sm sm:hidden">
            {dashboardLink}
            <MobileMenu>
              <div className="flex flex-col items-start gap-3 text-sm font-medium">
                {otherNavLinks}
                <div className="flex w-full flex-wrap items-center gap-3 border-t border-gray-200 pt-3 text-sm font-medium">
                  {accountArea}
                </div>
              </div>
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

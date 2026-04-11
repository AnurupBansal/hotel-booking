"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuth";

function AdminGuard({ children }: { children: ReactNode }) {
  const { admin, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !admin && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [loading, admin, isLoginPage, router]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/admin/dashboard"
            className="text-lg font-semibold text-gray-900"
          >
            Admin Panel
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 sm:flex">
            <nav className="flex gap-6">
              <Link
                href="/admin/dashboard"
                className={`text-sm font-medium transition ${
                  pathname === "/admin/dashboard"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/bookings"
                className={`text-sm font-medium transition ${
                  pathname.startsWith("/admin/bookings")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Bookings
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{admin.name}</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace("/admin/login");
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 sm:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 sm:hidden">
            <nav className="flex flex-col gap-1">
              <Link
                href="/admin/dashboard"
                className={`rounded-lg px-3 py-3 text-sm font-medium transition ${
                  pathname === "/admin/dashboard"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/bookings"
                className={`rounded-lg px-3 py-3 text-sm font-medium transition ${
                  pathname.startsWith("/admin/bookings")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Bookings
              </Link>
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-600">{admin.name}</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace("/admin/login");
                }}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AdminAuthProvider>
  );
}

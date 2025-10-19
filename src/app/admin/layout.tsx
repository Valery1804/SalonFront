"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/providers/AuthProvider";

const NAV_ITEMS = [
  { href: "/admin/inicio", label: "Resumen" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/personal", label: "Personal" },
  { href: "/admin/reportes", label: "Reportes" },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, initializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initializing) {
      if (!user) {
        router.replace("/auth/login?redirect=/admin/inicio");
      } else if (user.role !== "admin") {
        router.replace("/");
      }
    }
  }, [initializing, router, user]);

  const isAllowed = useMemo(
    () => Boolean(user && user.role === "admin"),
    [user],
  );

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-pink-400" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 text-center text-white">
        <p className="text-xs uppercase tracking-[0.4em] text-pink-300">
          Acceso restringido
        </p>
        <h1 className="text-3xl font-semibold">
          Necesitas privilegios de administrador
        </h1>
        <p className="max-w-md text-sm text-white/70">
          Inicia sesión con una cuenta autorizada para administrar el panel del
          salón. Si crees que se trata de un error, contacta al equipo técnico.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2 font-semibold text-white transition hover:border-white/40"
          >
            Volver al inicio
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-2 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:shadow-pink-500/50"
          >
            Cambiar de cuenta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-lg md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-pink-300">
              Panel SalonClick
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Bienvenido, {user.firstName ?? user.email}
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-yellow-400/60 bg-yellow-400/20 text-white shadow-lg shadow-yellow-300/20"
                      : "border-white/10 text-gray-200 hover:border-pink-400/60 hover:text-pink-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:px-10">
        {children}
      </main>
    </div>
  );
}

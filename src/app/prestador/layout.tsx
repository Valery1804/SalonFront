"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { FaCalendarAlt, FaClock, FaChartLine } from "react-icons/fa";

const NAV_ITEMS = [
  { href: "/prestador/mis-citas", label: "Mis Citas", icon: FaCalendarAlt },
  { href: "/prestador/horarios", label: "Mis Horarios", icon: FaClock },
  { href: "/prestador/estadisticas", label: "Estadísticas", icon: FaChartLine },
];

export default function PrestadorLayout({
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
        router.replace("/auth/login?redirect=/prestador/mis-citas");
      } else if (user.role !== "prestador_servicio") {
        router.replace("/");
      }
    }
  }, [initializing, router, user]);

  const isAllowed = useMemo(
    () => Boolean(user && user.role === "prestador_servicio"),
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
          Solo para Prestadores de Servicio
        </h1>
        <p className="max-w-md text-sm text-white/70">
          Esta sección está reservada para profesionales del salón. Inicia sesión
          con una cuenta de prestador de servicio.
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
            Iniciar sesión
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
              Panel de Prestador
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Hola, {user?.firstName ?? user?.email ?? "Profesional"}
            </h1>
            {user?.providerType && (
              <p className="mt-1 text-xs text-gray-400 capitalize">
                {user.providerType.replace("_", " ")}
              </p>
            )}
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-yellow-400/60 bg-yellow-400/20 text-white shadow-lg shadow-yellow-300/20"
                      : "border-white/10 text-gray-200 hover:border-pink-400/60 hover:text-pink-200"
                  }`}
                >
                  <Icon className="text-sm" />
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

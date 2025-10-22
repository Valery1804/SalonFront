"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { 
  FaChartBar, 
  FaCalendarAlt, 
  FaCut, 
  FaUsers, 
  FaClipboardList,
  FaSignOutAlt
} from 'react-icons/fa';

const NAV_ITEMS = [
  { href: "/admin/inicio", label: "Resumen", icon: <FaChartBar /> },
  { href: "/admin/agenda", label: "Agenda", icon: <FaCalendarAlt /> },
  { href: "/admin/servicios", label: "Servicios", icon: <FaCut /> },
  { href: "/admin/personal", label: "Personal", icon: <FaUsers /> },
  { href: "/admin/reportes", label: "Reportes", icon: <FaClipboardList /> },
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-5 md:px-8">
          <div className="flex items-center justify-between">
            {/* Logo and User Info */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 p-2 flex items-center justify-center">
                  <span className="text-2xl font-bold">SC</span>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-pink-300">
                    Panel SalonClick
                  </p>
                  <h1 className="text-xl font-semibold text-white">
                    {user?.firstName ?? user?.email ?? "Admin"}
                  </h1>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-5 py-3 text-base font-medium transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-pink-500/20 to-orange-400/20 text-white"
                        : "hover:bg-white/5 text-gray-300 hover:text-white"
                    }`}
                  >
                    <span className={`text-xl ${active ? 'text-pink-400' : 'text-gray-400 group-hover:text-pink-400'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/80 backdrop-blur-lg md:hidden">
        <nav className="flex items-center justify-around px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-pink-400"
                    : "text-gray-400 hover:text-pink-400"
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content with increased padding */}
      <main className="mx-auto max-w-7xl px-6 pb-28 pt-10 md:px-8 md:pb-20">
        {children}
      </main>
    </div>
  );
}

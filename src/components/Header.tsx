"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import ProfilePanel from "./ProfilePanel";
import Modal from "./Modal";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
interface NavItem {
  key: string;
  label: string;
  href: string;
  highlight?: boolean;
  show: boolean;
}

export default function Header() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, logout, initializing } = useAuth();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const isProvider = user?.role === "prestador_servicio";
  const canManageServices = Boolean(user && (isAdmin || isProvider));

  useEffect(() => {
    document.body.style.overflow = profileOpen || mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [profileOpen, mobileOpen]);

  const navLinks = useMemo<NavItem[]>(
    () => {
      if (isAdmin) {
        return [
          {
            key: "admin-inicio",
            label: "Inicio",
            href: "/admin/inicio",
            show: true,
          },
          {
            key: "admin-agenda",
            label: "Agenda de citas",
            href: "/admin/agenda",
            show: true,
          },
          {
            key: "admin-reportes",
            label: "Reportes",
            href: "/admin/reportes",
            show: true,
          },
          {
            key: "admin-personal",
            label: "Personal salón",
            href: "/admin/personal",
            show: true,
          },
          {
            key: "admin-servicios",
            label: "Servicios",
            href: "/admin/servicios",
            show: true,
          },
        ];
      }
      // Opciones normales para otros roles
      return [
        {
          key: "home",
          label: "Inicio",
          href: "/",
          show: true,
        },
        {
          key: "services",
          label: canManageServices ? "Gestionar servicios" : "Servicios",
          href: canManageServices ? "/services/create_service" : "/#servicios",
          show: true,
        },
        {
          key: "book",
          label: "Reservar",
          href: "/reservar",
          highlight: true,
          show: true,
        },
        {
          key: "team",
          label: "Personal salón",
          href: "/personal-salon",
          show: true,
        },
        {
          key: "myAppointments",
          label: "Mis citas",
          href: "/mis-citas",
          show: Boolean(user && user.role !== "admin"),
        },
        {
          key: "slots",
          label: isAdmin ? "Agenda general" : "Mis slots",
          href: "/dashboard/slots",
          show: Boolean(isProvider || isAdmin),
        },
      ].filter((item) => item.show);
    },
    [canManageServices, isAdmin, isProvider, user],
  );

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.email || "";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href.includes("#")) {
      const [base] = href.split("#");
      return base === pathname;
    }
    return pathname === href;
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    showToast({
      title: "Sesión cerrada",
      description: "Esperamos verte pronto.",
      variant: "info",
    });
    router.replace("/");
  };

  const renderNavLink = (link: NavItem, variant: "desktop" | "mobile") => {
    const active = isActive(link.href);
    if (variant === "desktop") {
      return (
        <Link
          key={link.key}
          href={link.href}
          onClick={() => setMobileOpen(false)}
          className={`group relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            link.highlight
              ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50"
              : "hover:text-white"
          } ${
            active && !link.highlight
              ? "text-white after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-pink-500 after:to-orange-400"
              : "text-gray-400"
          }`}
        >
          {link.label}
          {!link.highlight && (
            <span className="absolute inset-0 -z-10 scale-75 rounded-lg bg-white/5 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100" />
          )}
        </Link>
      );
    }

    return (
      <Link
        key={link.key}
        href={link.href}
        onClick={() => setMobileOpen(false)}
        className={`group relative overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
          link.highlight
            ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/30"
            : "border border-white/10 text-gray-200 hover:border-transparent hover:text-white"
        } ${active && !link.highlight ? "border-pink-400/50 text-white" : ""}`}
      >
        {link.label}
        {!link.highlight && (
          <span className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-500/20 to-orange-400/20 opacity-0 transition-all duration-200 group-hover:opacity-100" />
        )}
      </Link>
    );
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 px-5 py-4 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Enhanced Logo */}
        <Link
          href="/"
          className="group relative flex items-center gap-1 text-3xl font-black tracking-tight text-white transition-all duration-300 md:text-4xl lg:text-5xl"
        >
          <span className="relative">
            <span className="absolute -inset-2 -skew-x-12 bg-gradient-to-r from-pink-600 to-orange-400 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-40" />
            <span className="relative bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              SALON
            </span>
          </span>
          <span className="relative">
            <span className="absolute -inset-2 skew-x-12 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-40" />
            <span className="relative bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text font-bold text-transparent">
              CLICK
            </span>
          </span>
          <div className="absolute -bottom-1.5 left-0 h-px w-full bg-gradient-to-r from-pink-500/0 via-orange-400 to-yellow-400/0 opacity-0 transition-all duration-500 group-hover:opacity-100" />
        </Link>

        {/* Navigation with enhanced styling */}
        <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
          {navLinks.map((link) => renderNavLink(link, "desktop"))}
        </nav>

        {/* Enhanced profile buttons */}
        <div className="flex items-center gap-3">
          {initializing ? (
            <div className="h-11 w-28 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <>
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="group relative inline-flex items-center gap-3 rounded-full border border-white/10 px-5 py-2.5 text-base font-medium text-white transition-all duration-200 hover:border-transparent"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-400/20 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400">
                  <FaUser className="text-sm text-white transition-all duration-200 group-hover:scale-110" />
                </span>
                <span className="relative">{displayName || "Perfil"}</span>
              </button>
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition-all duration-200 hover:border-transparent lg:hidden"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-400/20 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                {mobileOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="group relative inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-base font-medium text-white transition-all duration-200 hover:border-transparent"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-400/20 opacity-0 transition-all duration-200 group-hover:opacity-100" />
                <span className="relative">Iniciar sesión</span>
              </Link>
              <Link
                href="/auth/register"
                className="hidden items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-2.5 text-base font-medium text-white shadow-lg shadow-pink-500/30 transition-all duration-200 hover:shadow-pink-500/50 hover:brightness-110 sm:inline-flex"
              >
                Registrarse
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition hover:border-white/30 lg:hidden"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
            </>
          )}
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-x-4 top-24 z-50 lg:hidden">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl">
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => renderNavLink(link, "mobile"))}
              </nav>
              {user ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(true);
                      setMobileOpen(false);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-pink-400/60"
                  >
                    <FaUser className="text-xs" />
                    Ver perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center rounded-full border border-red-400/50 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-300 hover:text-red-100"
                  >
                    Cerrar sesion
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-sm text-white">
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-2 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:shadow-pink-500/50"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Modal open={profileOpen} onClose={() => setProfileOpen(false)}>
        {user && (
          <ProfilePanel
            user={user}
            canManageServices={canManageServices}
            canAccessSlots={isProvider || isAdmin}
            onClose={() => setProfileOpen(false)}
            onLogout={handleLogout}
          />
        )}
      </Modal>
    </header>
  );
}


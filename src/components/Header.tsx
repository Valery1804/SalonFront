"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { FaUser } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import Modal from "./Modal";
import { useAuth } from "@/providers/AuthProvider";
import type { ProviderType, UserRole } from "@/types/user";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrador",
  cliente: "Cliente",
  prestador_servicio: "Prestador de servicio",
};

const PROVIDER_LABEL: Record<ProviderType, string> = {
  barbero: "Barbero",
  estilista: "Estilista",
  manicurista: "Manicurista",
  maquilladora: "Maquilladora",
};

interface NavItem {
  key: string;
  label: string;
  href: string;
  highlight?: boolean;
  show: boolean;
}

export default function Header() {
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
    () =>
      [
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
          label: "Personal salon",
          href: "/personal-salon",
          show: true,
        },
        {
          key: "myAppointments",
          label: "Mis citas",
          href: "/mis-citas",
          show: Boolean(user),
        },
        {
          key: "slots",
          label: isAdmin ? "Agenda general" : "Mis slots",
          href: "/dashboard/slots",
          show: Boolean(isProvider || isAdmin),
        },
      ].filter((item) => item.show),
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
    window.location.href = "/";
  };

  const renderNavLink = (link: NavItem, variant: "desktop" | "mobile") => {
    const active = isActive(link.href);
    if (variant === "desktop") {
      return (
        <Link
          key={link.key}
          href={link.href}
          onClick={() => setMobileOpen(false)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            link.highlight
              ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50"
              : "text-gray-300 hover:text-yellow-300"
          } ${active && !link.highlight ? "text-white" : ""}`}
        >
          {link.label}
        </Link>
      );
    }

    return (
      <Link
        key={link.key}
        href={link.href}
        onClick={() => setMobileOpen(false)}
        className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
          link.highlight
            ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/30"
            : "border border-white/10 text-gray-200 hover:bg-white/10"
        } ${active && !link.highlight ? "border-pink-400/50 text-white" : ""}`}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-800/80 bg-slate-900/80 px-5 py-4 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-2xl font-bold text-white md:text-3xl"
        >
          <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
            Salon
          </span>
          <span className="text-yellow-400">Click</span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm lg:flex xl:gap-3">
          {navLinks.map((link) => renderNavLink(link, "desktop"))}
        </nav>

        <div className="flex items-center gap-2">
          {initializing ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <>
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-pink-400/60 hover:text-pink-200"
              >
                <FaUser className="text-xs" />
                <span>{user.firstName ?? "Perfil"}</span>
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition hover:border-white/30 lg:hidden"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Iniciar sesion
              </Link>
              <Link
                href="/auth/register"
                className="hidden items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:shadow-pink-500/50 sm:inline-flex"
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
          <div className="space-y-5 text-white">
            <header>
              <p className="text-xs uppercase tracking-[0.4em] text-pink-300">Perfil</p>
              <h2 className="mt-1 text-2xl font-semibold">{displayName}</h2>
              <p className="text-sm text-gray-300">
                {ROLE_LABEL[user.role]}
                {user.providerType ? ` - ${PROVIDER_LABEL[user.providerType]}` : ""}
              </p>
            </header>

            <dl className="grid gap-3 text-sm text-gray-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Correo</dt>
                <dd className="mt-1">{user.email}</dd>
              </div>
              {user.phone && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Telefono</dt>
                  <dd className="mt-1">{user.phone}</dd>
                </div>
              )}
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Estado</dt>
                <dd className="mt-1">
                  {user.emailVerified ? "Email verificado" : "Verificacion pendiente"}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/mis-citas"
                onClick={() => setProfileOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 px-5 py-2 font-semibold text-white transition hover:border-pink-400/60"
              >
                Mis citas
              </Link>
              <Link
                href="/reservar"
                onClick={() => setProfileOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-5 py-2 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:shadow-pink-500/50"
              >
                Reservar nueva cita
              </Link>
              {canManageServices && (
                <Link
                  href="/services/create_service"
                  onClick={() => setProfileOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/10 px-5 py-2 font-semibold text-white transition hover:border-pink-400/60"
                >
                  Gestionar servicios
                </Link>
              )}
              {(isProvider || isAdmin) && (
                <Link
                  href="/dashboard/slots"
                  onClick={() => setProfileOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/10 px-5 py-2 font-semibold text-white transition hover:border-pink-400/60"
                >
                  Panel de agenda
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center rounded-full border border-red-400/50 px-5 py-2 font-semibold text-red-200 transition hover:border-red-300 hover:text-red-100"
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        )}
      </Modal>
    </header>
  );
}

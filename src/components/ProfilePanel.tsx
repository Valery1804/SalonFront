"use client";

import Link from "next/link";
import type { User } from "@/service/authService";

interface ProfilePanelProps {
  user: User;
  canManageServices: boolean;
  canAccessSlots: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfilePanel({
  user,
  canManageServices,
  canAccessSlots,
  onClose,
  onLogout,
}: ProfilePanelProps) {
  return (
    <div className="max-h-[75vh] space-y-6 overflow-y-auto pr-1 text-white">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.4em] text-pink-300">Perfil</p>
        <h2 className="text-2xl font-semibold">
          {user.fullName?.trim() ||
            `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
            user.email}
        </h2>
        <p className="text-sm text-gray-300 capitalize">
          {user.role.replace("_", " ")}
          {user.providerType ? ` - ${user.providerType.replace("_", " ")}` : ""}
        </p>
      </header>

      <dl className="grid gap-3 text-sm text-gray-200 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Correo</dt>
          <dd className="mt-1 break-all">{user.email}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Telefono</dt>
          <dd className="mt-1">{user.phone ?? "Sin registrar"}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Estado</dt>
          <dd className="mt-1">
            {user.emailVerified ? "Email verificado" : "Verificacion pendiente"}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">
            Ultimo acceso
          </dt>
          <dd className="mt-1">
            {user.updatedAt
              ? new Date(user.updatedAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Sin informacion"}
          </dd>
        </div>
      </dl>

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <Link
          href="/mis-citas"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2 font-semibold text-white transition hover:border-pink-400/60"
        >
          Mis citas
        </Link>
        <Link
          href="/reservar"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-5 py-2 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:shadow-pink-500/50"
        >
          Reservar cita
        </Link>
        {canManageServices ? (
          <Link
            href="/services/create_service"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2 font-semibold text-white transition hover:border-pink-400/60"
          >
            Gestionar servicios
          </Link>
        ) : null}
        {canAccessSlots ? (
          <Link
            href="/dashboard/slots"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2 font-semibold text-white transition hover:border-pink-400/60"
          >
            Panel de agenda
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center rounded-full border border-red-400/50 px-5 py-2 font-semibold text-red-200 transition hover:border-red-300 hover:text-red-100 sm:col-span-2"
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}

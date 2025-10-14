"use client";

import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/providers/AuthProvider";

export default function ProfilePage() {
  const { user, initializing, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <AuthLayout
      heroTitle="Gestiona tu perfil"
      heroSubtitle="Actualiza tus datos y protege tu informacion en SalonClick."
      heroDescription="Revisa tu correo, estado de verificacion y accesos directos sin salir de esta pantalla."
      footer={
        !user ? (
          <p className="text-center text-sm">
            No tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-pink-300 transition hover:text-orange-200"
            >
              Crear cuenta
            </Link>
          </p>
        ) : null
      }
    >
      {initializing ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-300">Cargando perfil...</p>
        </div>
      ) : user ? (
        <div className="space-y-6">
          <header className="text-center">
            <h1 className="text-3xl font-semibold text-white">
              {user.fullName?.trim() ||
                `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                user.email}
            </h1>
            <p className="mt-2 text-sm text-gray-300">{user.email}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-pink-300">
              {user.role.replace("_", " ")}
            </p>
          </header>

          <dl className="grid gap-4 text-sm text-gray-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">
                Telefono
              </dt>
              <dd className="mt-1">{user.phone ?? "Sin registrar"}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">
                Verificacion
              </dt>
              <dd className="mt-1">
                {user.emailVerified ? "Correo verificado" : "Verificacion pendiente"}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">
                Ultimo acceso
              </dt>
              <dd className="mt-1">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Sin informacion"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2 text-sm">
            <Link
              href="/mis-citas"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/10 px-5 py-2 font-semibold text-white transition hover:border-pink-400/60"
            >
              Ver mis citas
            </Link>
            <Link
              href="/reservar"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-5 py-2 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:shadow-pink-500/50"
            >
              Reservar una cita
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-full items-center justify-center rounded-full border border-red-400/50 px-5 py-2 font-semibold text-red-200 transition hover:border-red-300 hover:text-red-100"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-300">
            No hay sesion activa. Inicia sesion para ver tu perfil.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-pink-500/40"
          >
            Ir al inicio de sesion
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}

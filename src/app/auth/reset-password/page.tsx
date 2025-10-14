"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { getErrorMessage } from "@/utils/error";

function ResetPasswordFallback() {
  return (
    <AuthLayout
      heroTitle="Restablecer contrasena"
      heroSubtitle="Actualiza tu contrasena y recupera el acceso."
      heroDescription="Estamos preparando el formulario para que puedas crear una nueva contrasena de forma segura."
    >
      <p className="text-center text-sm text-gray-300">Cargando formulario...</p>
    </AuthLayout>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const tokenMissing = token.trim().length === 0;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (tokenMissing) {
      setError("Token de verificacion invalido.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://salonback-production.up.railway.app/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, password, confirmPassword }),
        },
      );

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Error al restablecer la contrasena");
      }

      setMessage("Listo. Tu contrasena se actualizo correctamente.");
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No se pudo restablecer la contrasena"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Restablecer contrasena"
      heroSubtitle="Elige una nueva contrasena segura."
      heroDescription="Asegurate de crear una contrasena que recuerdes y mantene tu cuenta protegida. Puedes volver a iniciar sesion inmediatamente despues."
      footer={
        <div className="text-center text-sm">
          <Link href="/auth/login" className="text-pink-300 hover:text-orange-300">
            Volver al inicio de sesion
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-200">
            Nueva contrasena
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className={inputClass}
            placeholder="Ingresa una contrasena segura"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
            Confirmar contrasena
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className={inputClass}
            placeholder="Repite la contrasena"
          />
        </div>

        <button
          type="submit"
          disabled={loading || tokenMissing}
          className="w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Restablecer contrasena"}
        </button>
      </form>

      {message ? (
        <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      {(tokenMissing || error) && (
        <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {tokenMissing ? "Token de verificacion no encontrado." : error}
        </p>
      )}
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

"use client";

import { Suspense, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/utils/error";

type LayoutProps = {
  title: string;
  children: ReactNode;
};

function ResetPasswordLayout({ title, children }: LayoutProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white px-6">
      <div className="bg-slate-900/60 p-10 rounded-2xl shadow-2xl max-w-md w-full border border-purple-700/20">
        <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
        {children}
        <div className="mt-10 text-center">
          <a href="/auth/login" className="text-pink-400 hover:text-orange-300 font-semibold">
            Volver al inicio de sesion
          </a>
        </div>
      </div>
    </main>
  );
}

function ResetPasswordFallback() {
  return (
    <ResetPasswordLayout title="Restablecer Contrasena">
      <p className="text-center text-gray-300">Cargando formulario...</p>
    </ResetPasswordLayout>
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
      const response = await fetch("https://salonback-production.up.railway.app/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Error al restablecer la contrasena");
      }

      setMessage("Listo. Tu contrasena se ha actualizado correctamente.");
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No se pudo restablecer la contrasena"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResetPasswordLayout title="Restablecer Contrasena">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block mb-2 font-semibold">
            Nueva contrasena
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-purple-500/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Nueva contrasena segura"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-2 font-semibold">
            Confirmar contrasena
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-purple-500/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Repite la nueva contrasena"
          />
        </div>

        <button
          type="submit"
          disabled={loading || tokenMissing}
          className={`w-full py-3 rounded-lg font-semibold text-lg transition-all ${
            loading || tokenMissing
              ? "bg-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 to-orange-400 hover:scale-105"
          }`}
        >
          {loading ? "Guardando..." : "Restablecer Contrasena"}
        </button>
      </form>

      {message && <p className="mt-6 text-green-400 text-center font-medium">{message}</p>}

      {(tokenMissing || error) && (
        <p className="mt-6 text-red-400 text-center font-medium">
          {tokenMissing ? "Token de verificacion no encontrado." : error}
        </p>
      )}
    </ResetPasswordLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

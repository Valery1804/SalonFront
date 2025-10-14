"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/service/authService";
import { getErrorMessage } from "@/utils/error";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await requestPasswordReset(email);
      setMessage(response || "Te enviamos un correo con las instrucciones para restablecer tu contrasena.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No pudimos solicitar el cambio de contrasena"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">Recuperar contrasena</h1>
        <p className="mt-2 text-sm text-gray-300">
          Ingresa tu correo electronico y te enviaremos un enlace para restablecer tu contrasena.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-gray-200">
            Correo electronico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
              placeholder="usuario@correo.com"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-pink-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-6 text-center text-sm">
          <Link href="/auth/login" className="text-pink-300 hover:text-orange-300">
            Volver al inicio de sesion
          </Link>
        </div>
      </div>
    </main>
  );
}

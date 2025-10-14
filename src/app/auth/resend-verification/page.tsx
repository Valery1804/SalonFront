"use client";

import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://salonback-production.up.railway.app/api/auth/resend-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = (await response.json()) as { message?: string };

      if (response.ok) {
        setMessage("Listo. Te enviamos un nuevo correo de verificacion.");
        setEmail("");
      } else if (response.status === 400) {
        setError(data.message ?? "Este correo ya fue verificado.");
      } else if (response.status === 404) {
        setError(data.message ?? "No encontramos una cuenta con ese correo.");
      } else {
        setError(data.message ?? "No pudimos reenviar el correo de verificacion.");
      }
    } catch (caughtError) {
      setError("No fue posible conectar con el servidor. Intentalo mas tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Reenviar correo de verificacion"
      heroSubtitle="Confirma tu cuenta para aprovechar todas las funciones."
      heroDescription="Ingresa el correo con el que te registraste y te enviaremos un nuevo enlace de activacion."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-200">
            Correo electronico
          </label>
          <input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Reenviar correo"}
        </button>
      </form>

      {message ? (
        <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </AuthLayout>
  );
}

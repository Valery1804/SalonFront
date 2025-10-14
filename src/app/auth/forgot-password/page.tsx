"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
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
      setMessage(
        response ||
          "Te enviamos un correo con las instrucciones para restablecer tu contrasena.",
      );
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No pudimos solicitar el cambio de contrasena"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroTitle="Olvidaste tu contrasena?"
      heroSubtitle="Te ayudamos a restablecer el acceso en pocos pasos."
      heroDescription="Ingresa el correo con el que registraste tu cuenta. Te enviaremos un enlace seguro para crear una nueva contrasena cuando quieras."
      footer={
        <div className="text-center text-sm">
          <Link href="/auth/login" className="text-pink-300 hover:text-orange-300">
            Volver a iniciar sesion
          </Link>
        </div>
      }
    >
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-white">Recuperar contrasena</h1>
        <p className="mt-2 text-sm text-gray-300">
          Enviaremos las instrucciones a tu correo electronico.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-gray-200">
          Correo electronico
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
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

      {message ? (
        <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </AuthLayout>
  );
}

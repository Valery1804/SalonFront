"use client";

import { useState } from "react";
import { getErrorMessage } from "@/utils/error";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(
        "https://salonback-production.up.railway.app/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al solicitar recuperación");
      }

      setMessage("✅ Se ha enviado un correo para restablecer tu contraseña.");
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Error al solicitar recuperación"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white px-6">
      <div className="bg-slate-900/60 p-10 rounded-2xl shadow-2xl max-w-md w-full border border-purple-700/20">
        <h1 className="text-3xl font-bold text-center mb-6">
          Recuperar Contraseña 🔑
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 font-semibold">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-purple-500/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-lg transition-all ${
              loading
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-orange-400 hover:scale-105"
            }`}
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        {message && (
          <p className="mt-6 text-green-400 text-center font-medium">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-6 text-red-400 text-center font-medium">{error}</p>
        )}

        <div className="mt-10 text-center">
          <a
            href="/auth/login"
            className="text-pink-400 hover:text-orange-300 font-semibold"
          >
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    </main>
  );
}

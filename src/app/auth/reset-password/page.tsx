"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/utils/error";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || ""; // token viene por URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://salonback-production.up.railway.app/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, password, confirmPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al restablecer la contraseña");
      }

      setMessage("✅ Tu contraseña se ha actualizado correctamente.");
    } catch (error: unknown) {
      setError(getErrorMessage(error, "No se pudo restablecer la contrasena"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white px-6">
      <div className="bg-slate-900/60 p-10 rounded-2xl shadow-2xl max-w-md w-full border border-purple-700/20">
        <h1 className="text-3xl font-bold text-center mb-6">
          Restablecer Contraseña 🔒
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block mb-2 font-semibold">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-purple-500/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Nueva contraseña segura"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2 font-semibold">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-purple-500/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Repite la nueva contraseña"
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
            {loading ? "Guardando..." : "Restablecer Contraseña"}
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

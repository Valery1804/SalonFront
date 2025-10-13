"use client";

import { useState } from "react";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://salonback-production.up.railway.app/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Email de verificación reenviado correctamente.");
        setEmail("");
      } else {
        // Muestra mensaje del backend o un texto por defecto
        setMessage(
          data.message ||
            (res.status === 400
              ? "⚠️ El email ya fue verificado."
              : res.status === 404
              ? "❌ Usuario no encontrado."
              : "❌ Error al reenviar el email.")
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reenviar Verificación</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Correo Electrónico</label>
            <input
              type="email"
              placeholder="Ingresa tu correo registrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition"
          >
            {loading ? "Enviando..." : "Reenviar Email"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
        )}
      </div>
    </main>
  );
}

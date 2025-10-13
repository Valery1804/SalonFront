"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verificando tu correo...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("❌ Token de verificación no encontrado.");
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `https://salonback-production.up.railway.app/api/auth/verify-email?token=${token}`
        );

        const data = await res.json();

        if (res.ok) {
          setMessage("✅ Email verificado exitosamente. Ya puedes iniciar sesión.");
        } else {
          setMessage(data.message || "❌ Token de verificación inválido.");
        }
      } catch (error) {
        console.error(error);
        setMessage("⚠️ Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Verificación de Email</h1>

        {loading ? (
          <p className="text-gray-300 animate-pulse">Verificando...</p>
        ) : (
          <p className="text-gray-300">{message}</p>
        )}

        {!loading && message.includes("exitosamente") && (
          <a
            href="/auth/login"
            className="inline-block mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition"
          >
            Ir al login
          </a>
        )}
      </div>
    </main>
  );
}

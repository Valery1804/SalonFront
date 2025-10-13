"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/utils/error";

interface VerifyEmailState {
  message: string;
  loading: boolean;
}

function VerifyEmailCard({ message, loading }: VerifyEmailState) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Verificacion de Email</h1>
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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyEmailState>({
    message: "Verificando tu correo...",
    loading: true,
  });

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState({
        message: "Token de verificacion no encontrado.",
        loading: false,
      });
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `https://salonback-production.up.railway.app/api/auth/verify-email?token=${token}`
        );

        const data = (await response.json()) as { message?: string };

        if (response.ok) {
          setState({
            message: "Listo. Email verificado exitosamente. Ya puedes iniciar sesion.",
            loading: false,
          });
        } else {
          setState({
            message: data.message ?? "Token de verificacion invalido.",
            loading: false,
          });
        }
      } catch (error: unknown) {
        setState({
          message: getErrorMessage(error, "Error al conectar con el servidor."),
          loading: false,
        });
      }
    };

    verifyEmail();
  }, [searchParams]);

  return <VerifyEmailCard {...state} />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailCard message="Verificando tu correo..." loading={true} />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

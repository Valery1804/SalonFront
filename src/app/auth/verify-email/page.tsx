"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { getErrorMessage } from "@/utils/error";

interface VerifyEmailState {
  message: string;
  loading: boolean;
  success: boolean;
}

function VerifyEmailCard({ message, loading, success }: VerifyEmailState) {
  return (
    <AuthLayout
      heroTitle="Verificacion de correo"
      heroSubtitle="Confirma tu correo electronico para activar tu cuenta."
      heroDescription="Validamos el token enviado a tu correo para mantener tu cuenta protegida y confirmar que eres la persona autorizada."
    >
      <div className="space-y-4 text-center">
        {loading ? (
          <p className="text-sm text-gray-300 animate-pulse">Verificando...</p>
        ) : (
          <p className="text-sm text-gray-300">{message}</p>
        )}
        {!loading && success ? (
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-pink-500/40"
          >
            Ir al inicio de sesion
          </Link>
        ) : null}
      </div>
    </AuthLayout>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyEmailState>({
    message: "Verificando tu correo...",
    loading: true,
    success: false,
  });

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState({
        message: "Token de verificacion no encontrado.",
        loading: false,
        success: false,
      });
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `https://salonback-production.up.railway.app/api/auth/verify-email?token=${token}`,
        );

        const data = (await response.json()) as { message?: string };

        if (response.ok) {
          setState({
            message: "Listo. Correo verificado exitosamente. Ya puedes iniciar sesion.",
            loading: false,
            success: true,
          });
        } else {
          setState({
            message: data.message ?? "Token de verificacion invalido.",
            loading: false,
            success: false,
          });
        }
      } catch (error: unknown) {
        setState({
          message: getErrorMessage(error, "No pudimos conectar con el servidor."),
          loading: false,
          success: false,
        });
      }
    };

    void verifyEmail();
  }, [searchParams]);

  return <VerifyEmailCard {...state} />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <VerifyEmailCard message="Verificando tu correo..." loading={true} success={false} />
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

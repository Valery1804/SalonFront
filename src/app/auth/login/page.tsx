"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { getErrorMessage } from "@/utils/error";

export default function Login() {
  const router = useRouter();
  const { showToast } = useToast();
  const { login: loginUser, authenticating } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const data = await loginUser(email, password);
      showToast({
        variant: "success",
        title: `Bienvenido ${data.user.firstName ?? data.user.email}`,
        description: "Sesión iniciada correctamente.",
      });
      if (data.user.role === "admin") {
        router.replace("/admin/inicio");
      } else {
        router.replace("/");
      }
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No se pudo iniciar sesion"));
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60";

  return (
    <AuthLayout
      heroTitle="Bienvenido de nuevo"
      heroSubtitle="Ingresa a tu cuenta para continuar administrando tus citas y servicios."
      heroDescription="Si eres nuevo, crea una cuenta en minutos. Tus datos y preferencias quedan guardados para darte una experiencia fluida cada vez que ingreses."
      footer={
        <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-gray-300 transition hover:text-pink-300"
          >
            Olvidaste tu contrasena?
          </Link>
          <p className="text-sm">
            Aun no tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-pink-300 transition hover:text-orange-200"
            >
              Registrate aqui
            </Link>
          </p>
        </div>
      }
    >
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-semibold text-white">Iniciar sesion</h2>
        <p className="mt-2 text-sm text-gray-300">
          Accede con tu correo y contrasena para gestionar tu experiencia en SalonClick.
        </p>
      </header>

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

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-200">
            Contrasena
          </label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className={inputClass}
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={authenticating}
          className="w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {authenticating ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </AuthLayout>
  );
}

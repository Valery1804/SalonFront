"use client";

import { useState } from "react";
import Link from "next/link";
import { getErrorMessage } from "@/utils/error";
import { useAuth } from "@/providers/AuthProvider";

export default function Login() {
  const { login: loginUser, authenticating } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const data = await loginUser(email, password);
      alert(`Bienvenido ${data.user.firstName}`);
      window.location.href = "/";
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No se pudo iniciar sesion"));
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-900 to-indigo-900 py-12 px-4">
      <div className="bg-white text-black rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">
          Iniciar Sesion
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electronico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="password"
            placeholder="Contrasena"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={authenticating}
            className="w-full bg-pink-600 text-white py-3 rounded-full hover:bg-pink-500 transition-colors font-semibold"
          >
            {authenticating ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="flex justify-between text-sm text-purple-800 mt-4">
          <Link href="/recuperar-password" className="hover:underline">
            Olvidaste tu contrasena?
          </Link>
          <Link href="/auth/register" className="hover:underline font-semibold">
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

// app/login/page.tsx
"use client";

import Link from "next/link";

export default function Login() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá tu lógica de autenticación
    console.log("Formulario enviado");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-900 to-indigo-900 py-12 px-4">
      <div className="bg-white text-black rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">
          Iniciar Sesión
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-semibold mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="ejemplo@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block font-semibold mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="********"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-full hover:bg-pink-500 transition-colors font-semibold"
          >
            Ingresar
          </button>
          
          <div className="flex justify-between text-sm text-purple-800 mt-4">
            <Link href="/recuperar-password" className="hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
            <Link href="/registro" className="hover:underline font-semibold">
              Registrarse
            </Link>
          </div>
        </form>

        {/* Opciones adicionales */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-4">
            O continúa con
          </p>
          <div className="space-y-2">
            <button className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-semibold">Google</span>
            </button>
            <button className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-semibold">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
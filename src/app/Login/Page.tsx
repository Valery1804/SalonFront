// app/login/page.tsx
"use client";

import Link from "next/link";

export default function Login() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-4">
        <div>
          <Link href="/" className="text-xl font-bold">
            SalonClick
          </Link>
        </div>
        <div>
          <input
            type="text"
            placeholder="Buscar..."
            className="rounded px-3 py-1 text-black"
          />
        </div>
      </header>

      {/* LOGIN */}
      <section className="flex flex-1 justify-center items-center">
        <div className="bg-white text-black rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">
            Iniciar Sesión
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block font-semibold">Correo electrónico</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="ejemplo@email.com"
              />
            </div>
            <div>
              <label className="block font-semibold">Contraseña</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="********"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded-full hover:bg-pink-500"
            >
              Ingresar
            </button>
            <div className="flex justify-between text-sm text-purple-800 mt-2">
              <Link href="#" className="hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
              <Link href="#" className="hover:underline">
                Registrarse
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-4 bg-purple-900">
        <p>© 2025 SalonClick. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

"use client";

import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { useAuth } from "@/providers/AuthProvider";

export default function Header() {
  const { user, logout, initializing } = useAuth();

  const isProvider = user?.role === "prestador_servicio";

  const displayName = user?.firstName ?? user?.email ?? "";

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl fixed top-0 left-0 w-full z-50 border-b border-slate-700">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Salon</span>
          <span className="text-yellow-400">Click</span>
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-wider">Beauty & Style</p>
      </div>

      <nav className="hidden md:flex gap-8 text-sm">
        <Link href="#inicio" className="text-white font-medium hover:text-yellow-400 transition-colors border-b-2 border-yellow-400 pb-1">
          Inicio
        </Link>
        <Link href="#servicios" className="text-gray-300 hover:text-yellow-400 transition-colors">
          Servicios
        </Link>
        <Link href="/reservar" className="text-gray-300 hover:text-yellow-400 transition-colors">
          Reservar Cita
        </Link>
        <Link href="#contacto" className="text-gray-300 hover:text-yellow-400 transition-colors">
          Contacto
        </Link>
      </nav>

      <div className="flex gap-4 items-center">
        {!initializing && isProvider && (
          <Link
            href="/dashboard/slots"
            className="hidden md:flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 transition-colors border border-white/20 px-4 py-2 rounded-full"
          >
            Mis Slots
          </Link>
        )}
        {!initializing && user ? (
          <>
            <div className="flex items-center gap-2 text-white border border-white/30 px-4 py-2 rounded-full">
              <FaUser className="text-sm" />
              <span className="text-sm">{displayName}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-white hover:text-yellow-400 transition-colors border border-white/30 px-4 py-2 rounded-full"
            >
              Cerrar Sesion
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors border border-white/30 px-4 py-2 rounded-full"
          >
            <FaUser className="text-sm" />
            <span className="text-sm">Iniciar Sesion</span>
          </Link>
        )}
        <Link href="/reservar" className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all font-medium text-sm">
          Agendar Cita
        </Link>
      </div>
    </header>
  );
}

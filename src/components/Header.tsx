"use client";

import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import Modal from "./Modal";

export default function Header() {

  const { user, logout, initializing } = useAuth();
  const displayName = user?.firstName ?? user?.email ?? "";
  const [openModal, setOpenModal] = useState(false);

  const handleProfileClick = () => {
    setOpenModal(true);
  };

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
        {/* Solo mostrar Servicios si el usuario es admin o prestador_servicio */}
        {user && (user.role === "admin" || user.role === "prestador_servicio") && (
          <Link href="#servicios" className="text-gray-300 hover:text-yellow-400 transition-colors">
            Servicios
          </Link>
        )}
        <Link href="/mis-citas" className="text-gray-300 hover:text-yellow-400 transition-colors">
          Mis citas
        </Link>
        <Link href="/personal-salon" className="text-gray-300 hover:text-yellow-400 transition-colors">
          Personal Salón
        </Link>
      </nav>

      <div className="flex gap-4 items-center">
        {!initializing && user ? (
          <>
            <button
              type="button"
              onClick={handleProfileClick}
              className="flex items-center gap-2 text-white border border-white/30 px-4 py-2 rounded-full hover:text-yellow-400 transition-colors"
              title="Ver perfil"
            >
              <FaUser className="text-sm" />
              <span className="text-sm underline cursor-pointer">{displayName}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-white hover:text-yellow-400 transition-colors border border-white/30 px-4 py-2 rounded-full"
            >
              Cerrar Sesion
            </button>
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
              <div className="bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 rounded-xl p-1 shadow-lg">
                <div className="bg-white rounded-lg p-6 min-w-[320px] max-w-[90vw] relative">
                  <h2 className="text-2xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 text-center">Perfil de Usuario</h2>
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                      <FaUser />
                    </div>
                    <div className="text-lg font-bold text-gray-800">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <div className="space-y-2 text-base">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-pink-500">Teléfono:</span>
                      <span className="text-gray-700">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-500">Rol:</span>
                      <span className="text-gray-700 capitalize">{user.role ?? "No definido"}</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    {user.role === "admin" && (
                      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold shadow">Administrador</span>
                    )}
                    {user.role === "cliente" && (
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold shadow">Cliente</span>
                    )}
                    {user.role === "prestador_servicio" && (
                      <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-semibold shadow">Prestador de Servicio</span>
                    )}
                  </div>
                  <div className="mt-6 flex flex-col gap-2">
                    {/* Opciones de acceso según el rol */}
                    {(user.role === "admin" || user.role === "prestador_servicio") && (
                      <Link href="/services/create_service" className="block w-full text-center bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold py-2 rounded-lg shadow hover:scale-105 transition-all">Servicios</Link>
                    )}
                    <Link href="/reservar" className="block w-full text-center bg-yellow-400 text-slate-900 font-semibold py-2 rounded-lg shadow hover:scale-105 transition-all">Agendar Cita</Link>
                  </div>
                </div>
              </div>
            </Modal>
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

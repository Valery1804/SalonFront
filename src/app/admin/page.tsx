"use client";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Panel de Administrador</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <Link href="/admin/agenda" className="block bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition-all border border-yellow-200">
          <h2 className="text-2xl font-bold mb-2 text-pink-500">Agenda de Citas</h2>
          <p className="text-gray-600">Visualiza las citas agendadas para el día.</p>
        </Link>
        <Link href="/admin/reportes" className="block bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition-all border border-yellow-200">
          <h2 className="text-2xl font-bold mb-2 text-orange-500">Reportes</h2>
          <p className="text-gray-600">Consulta los reportes mensuales de citas agendadas.</p>
        </Link>
        <Link href="/admin/personal" className="block bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition-all border border-yellow-200">
          <h2 className="text-2xl font-bold mb-2 text-blue-500">Personal del Salón</h2>
          <p className="text-gray-600">Revisa el personal disponible en el salón.</p>
        </Link>
        <Link href="/admin/servicios" className="block bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transition-all border border-yellow-200">
          <h2 className="text-2xl font-bold mb-2 text-green-500">Servicios</h2>
          <p className="text-gray-600">Gestiona los servicios que ofrece el salón.</p>
        </Link>
      </div>
    </div>
  );
}

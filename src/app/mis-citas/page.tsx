"use client";
import { FaCalendarAlt } from "react-icons/fa";

export default function MisCitas() {
  // Simulación de historial vacío
  const citas = [];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 py-10">
      <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Mis Citas</h1>
      {citas.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <FaCalendarAlt className="text-6xl text-yellow-400" />
          <p className="text-lg text-gray-500">No tienes citas agendadas aún.</p>
          <div className="w-full max-w-md bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="w-full h-64 flex items-center justify-center text-gray-300 text-2xl border-2 border-dashed border-yellow-300 rounded-lg">
              Calendario vacío
            </div>
          </div>
        </div>
      ) : (
        <div> {/* Aquí iría el historial de citas */} </div>
      )}
    </div>
  );
}

"use client";

export default function AdminReportes() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-yellow-100 py-10">
      <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Reportes Mensuales</h1>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <p className="text-lg text-gray-500 mb-4">Aquí se mostrarán los reportes de citas agendadas mensualmente.</p>
        <div className="w-full h-64 flex items-center justify-center text-gray-300 text-2xl border-2 border-dashed border-orange-300 rounded-lg">
          Sin reportes disponibles
        </div>
      </div>
    </div>
  );
}

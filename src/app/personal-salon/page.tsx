"use client";
import { FaUserTie, FaPaintBrush, FaCut, FaHandSparkles } from "react-icons/fa";

const personal = [
  { nombre: "Barbero", icono: <FaUserTie className="text-4xl text-blue-500" />, servicios: ["Corte de cabello", "Barba", "Afeitado"] },
  { nombre: "Maquilladora", icono: <FaPaintBrush className="text-4xl text-pink-500" />, servicios: ["Maquillaje social", "Maquillaje de novia"] },
  { nombre: "Estilista", icono: <FaCut className="text-4xl text-orange-500" />, servicios: ["Peinados", "Coloración", "Tratamientos"] },
  { nombre: "Manicurista", icono: <FaHandSparkles className="text-4xl text-green-500" />, servicios: ["Manicure", "Pedicure", "Uñas acrílicas"] },
];

export default function PersonalSalon() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 py-10">
      <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Personal del Salón</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {personal.map((p) => (
          <div key={p.nombre} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-yellow-200">
            {p.icono}
            <h2 className="text-xl font-bold mt-4 mb-2 text-gray-800">{p.nombre}</h2>
            <ul className="text-gray-600 text-base list-disc pl-5">
              {p.servicios.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

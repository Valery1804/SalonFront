"use client";

import Link from "next/link";

export default function ReservarPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white pt-28 px-6">
      <section className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-orange-400 text-transparent bg-clip-text">
          Reserva tu cita
        </h1>
        <p className="text-gray-400 mb-12">
          Completa el formulario para agendar tu cita en <strong>SalonClick</strong>.  
          Te confirmaremos por correo o WhatsApp lo antes posible.
        </p>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div>
            <label className="block mb-2 text-sm text-gray-300">Nombre completo</label>
            <input type="text" placeholder="Tu nombre" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">Correo electrónico</label>
            <input type="email" placeholder="tucorreo@example.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">Teléfono</label>
            <input type="tel" placeholder="300 123 4567" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">Servicio</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white">
              <option>Corte de cabello</option>
              <option>Manicure</option>
              <option>Pedicure</option>
              <option>Tinte</option>
              <option>Peinado</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">Fecha</label>
            <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">Hora</label>
            <input type="time" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm text-gray-300">Comentarios adicionales</label>
            <textarea placeholder="Escribe aquí..." rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"></textarea>
          </div>
        </form>

        <button className="mt-8 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-pink-500/40 transition-all">
          Confirmar Reserva
        </button>

        <p className="mt-8 text-gray-500 text-sm">
          ¿Deseas volver al inicio?{" "}
          <Link href="/" className="text-yellow-400 hover:underline">
            Regresar
          </Link>
        </p>
      </section>
    </main>
  );
}

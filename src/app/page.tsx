// app/page.tsx
"use client";

import Image from "next/image";

import { FaUser, FaCut, FaHandSparkles, FaPalette } from "react-icons/fa";

export default function Home() {
  return (
    <main className="font-inter bg-slate-900">
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl fixed top-0 left-0 w-full z-50 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Salon</span>
            <span className="text-yellow-500">Click</span>
          </h1>
          <p className="text-1xs text-gray-200 uppercase tracking-wider">Beauty & Style</p>
        </div>

        <nav className="hidden md:flex gap-8 text-6sm">
          <a href="#inicio" className="text-white font-medium hover:text-yellow-400 transition-colors border-b-2 border-yellow-400 pb-1">
            Inicio
          </a>
          <a href="#servicios" className="text-gray-300 hover:text-yellow-400 transition-colors border-b-2 border-yellow-400 pb-1">
            Servicios
          </a>
          <a href="#reservar" className="text-gray-300 hover:text-yellow-400 transition-colors border-b-2 border-yellow-400 pb-1">
            Reservar Cita
          </a>
          <a href="#contacto" className="text-gray-300 hover:text-yellow-400 transition-colors border-b-2 border-yellow-400 pb-1">
            Contacto
          </a>
        </nav>

        <div className="flex gap-4 items-center">
          <a href="/login" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors border border-white/30 px-4 py-2 rounded-full">
            <FaUser className="text-sm" />
            <span className="text-sm">Iniciar Sesión</span>
          </a>
          <a href="#reservar" className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all font-medium text-sm">
            Agendar Cita
          </a>
        </div>
      </header>

      {/* HERO */}
        <section id="inicio" className="relative min-h-screen flex items-center justify-center">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="/salon.jpg"
            alt="Salon de belleza"
            fill
            className="object-cover"
            priority 
          />
          
             <div className="absolute inset-0 bg-purple-500/20 hover:bg-purple-700/40 transition-colors duration-500"></div>
            </div>

        {/* Contenido Hero centrado */}
        <div className="relative z-10 text-center max-w-5xl px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 leading-tight">
            Tu estilo, tu tiempo.
          </h1>
          <h2 className="mt-6 text-2xl md:text-4xl text-white">
            Reserva fácil con{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 font-bold">
              SalonClick
            </span>
          </h2>
          <p className="mt-6 text-gray-200 text-lg max-w-2xl mx-auto">
            Experimenta la belleza de una manera completamente nueva. Agenda tu cita en segundos.
          </p>
          <div className="mt-10 flex gap-6 justify-center flex-wrap">
            <a
              href="#reservar"
              className="bg-gradient-to-r from-pink-500 to-orange-400 px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-pink-500/50 transition-all font-semibold text-lg"
            >
              Reservar Ahora
            </a>
            <a
              href="#servicios"
              className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-slate-900 transition-all font-semibold text-lg"
            >
              Ver Servicios
            </a>
          </div>
        </div>
      </section>



      {/* SERVICIOS */}
      <section id="servicios" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white">Nuestros Servicios</h2>
          <p className="text-gray-400 mt-3 text-lg">Descubre la excelencia en cada detalle</p>
          <div className="grid md:grid-cols-4 gap-8 mt-12">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all border border-slate-700 group">
              <FaCut className="text-5xl text-pink-500 mb-6 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-xl">Corte de Cabello</h3>
              <p className="text-sm text-gray-400 mt-2">Estilos modernos y clásicos</p>
              <span className="block mt-4 font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Desde $25</span>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all border border-slate-700 group">
              <FaHandSparkles className="text-5xl text-pink-500 mb-6 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-xl">Manicure & Pedicure</h3>
              <p className="text-sm text-gray-400 mt-2">Cuidado profesional</p>
              <span className="block mt-4 font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Desde $20</span>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all border border-slate-700 group">
              <FaPalette className="text-5xl text-pink-500 mb-6 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-xl">Maquillaje</h3>
              <p className="text-sm text-gray-400 mt-2">Para eventos especiales</p>
              <span className="block mt-4 font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Desde $35</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-slate-950 to-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex justify-between flex-wrap gap-8 px-6">
          <div>
            <h3 className="text-3xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Salon</span>
              <span className="text-yellow-400">Click</span>
            </h3>
            <p className="text-gray-400 mt-2">Tu estilo, tu tiempo</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3 text-yellow-400">Contacto</h4>
            <p className="text-gray-400">+57 300 123 4567</p>
            <p className="text-gray-400">info@salonclick.com</p>
            <p className="text-gray-400">Bogotá, Colombia</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3 text-yellow-400">Enlaces</h4>
            <a href="#inicio" className="block text-gray-400 hover:text-pink-400 transition-colors">Inicio</a>
            <a href="#servicios" className="block text-gray-400 hover:text-pink-400 transition-colors">Servicios</a>
            <a href="#reservar" className="block text-gray-400 hover:text-pink-400 transition-colors">Reservar</a>
            <a href="#contacto" className="block text-gray-400 hover:text-pink-400 transition-colors">Contacto</a>
          </div>
        </div>
        <div className="text-center mt-8 border-t border-slate-800 pt-6">
          <p className="text-gray-500">© 2025 SalonClick. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
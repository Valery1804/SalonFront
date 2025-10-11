// app/page.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";



import Image from "next/image";

import { FaUser, FaCut, FaHandSparkles, FaPalette } from "react-icons/fa";

export default function Home() {
  return (
    <main className="font-inter bg-slate-900">
      
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
              href="/reservar"
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
      


      {/* CARRUSEL DE FOTOS */}
  <section className="bg-slate-900 py-16" id="galeria">
    <div className="max-w-5xl mx-auto text-center mb-8">
      <h2 className="text-4xl font-bold text-white">Momentos SalonClick</h2>
      <p className="text-gray-400 mt-2">Inspírate con nuestros mejores looks</p>
    </div>

  <Swiper

    modules={[Autoplay, Pagination]}
    autoplay={{ delay: 2500 }}
    pagination={{ clickable: true }}
    loop={true}
    spaceBetween={30}
    slidesPerView={1}
    className="max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden"
  >
    <SwiperSlide>
      <img src="/maquillaje.jpg" alt="Maquillaje profesional" className="w-full h-[500px] object-cover" />
    </SwiperSlide>
    <SwiperSlide>
      <img src="/estilo.jpg" alt="Peinado elegante" className="w-full h-[500px] object-cover" />
    </SwiperSlide>
    <SwiperSlide>
      <img src="/manicure.jpg" alt="Manicure" className="w-full h-[500px] object-cover" />
    </SwiperSlide>
    <SwiperSlide>
      <img src="/barberia.jpg" alt="Barberia" className="w-full h-[500px] object-cover" />
    </SwiperSlide>

  </Swiper>
    </section>



     {/* SERVICIOS */}
    <section id="servicios" className="py-28 bg-gradient-to-b from-slate-900 to-slate-800 text-center">
      <div className="max-w-7xl mx-auto px-6">
       
        <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
          Nuestros Servicios
        </h2>
        <p className="text-gray-400 text-lg md:text-xl mb-12">
          Vive una experiencia única con el cuidado y estilo que mereces ✨
        </p>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-items-center">
          {/* Corte de Cabello */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-700 hover:scale-105 transition-transform duration-400 w-full max-w-xs">
            <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
              <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-orange-400">
                <FaCut className="text-white text-5xl" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3">Corte de Cabello</h3>
            <p className="text-gray-400 text-base mb-5">Estilos modernos y clásicos, personalizados según tu forma de rostro.</p>
            <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Desde $25</span>
          </div>

          {/* Manicure & Pedicure */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-700 hover:scale-105 transition-transform duration-400 w-full max-w-xs">
            <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
              <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-orange-400">
                <FaHandSparkles className="text-white text-5xl" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3">Manicure & Pedicure</h3>
            <p className="text-gray-400 text-base mb-5">Cuidado profesional con productos de calidad para uñas y piel.</p>
            <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Desde $20</span>
          </div>

          {/* Maquillaje Profesional */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-700 hover:scale-105 transition-transform duration-400 w-full max-w-xs">
            <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
              <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-orange-400">
                <FaPalette className="text-white text-5xl" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3">Maquillaje Profesional</h3>
            <p className="text-gray-400 text-base mb-5">Looks para eventos, fotos y ocasiones especiales con acabado duradero.</p>
            <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Desde $35</span>
          </div>

          {/* Barbería */}
          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-700 hover:scale-105 transition-transform duration-400 w-full max-w-xs">
            <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
              <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-orange-400 text-white text-5xl">
                <span className="leading-none">💈</span>
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3">Barbería</h3>
            <p className="text-gray-400 text-base mb-5">Afeitado clásico, degradados y estilos masculinos con acabado profesional.</p>
            <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Desde $30</span>
          </div>
        </div>
      </div>
    </section>

   {/* VALORACIONES CON CARRUSEL Y ESTADÍSTICAS */}
    <section className="relative py-28 bg-gradient-to-b from-slate-800 to-slate-900 text-center overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-orange-400/5 to-yellow-300/5 blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Título principal */}
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 mb-6">
          Lo que dicen nuestros clientes 💬
        </h2>
        <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto">
          Más de <span className="text-pink-400 font-semibold">500 clientes felices</span> confían en nosotros
          para resaltar su estilo y disfrutar de un servicio de primera.
        </p>

        {/* 🔥 Sección de estadísticas / valoración general */}
        <div className="grid md:grid-cols-3 gap-10 text-center mb-20">
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/10 hover:scale-105 hover:shadow-pink-500/20 transition-all">
            <h3 className="text-5xl font-bold text-pink-500 mb-2">4.9★</h3>
            <p className="text-gray-300 font-semibold">Valoración Promedio</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/10 hover:scale-105 hover:shadow-orange-500/20 transition-all">
            <h3 className="text-5xl font-bold text-orange-400 mb-2">+1200</h3>
            <p className="text-gray-300 font-semibold">Citas Realizadas</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/10 hover:scale-105 hover:shadow-yellow-500/20 transition-all">
            <h3 className="text-5xl font-bold text-yellow-400 mb-2">98%</h3>
            <p className="text-gray-300 font-semibold">Clientes Satisfechos</p>
          </div>
        </div>

        {/* 💫 Carrusel de testimonios */}
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={true}
          spaceBetween={30}
          slidesPerView={1}
          className="max-w-4xl mx-auto"
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 2 },
          }}
        >
          {/* Testimonio 1 */}
          <SwiperSlide>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-10 shadow-2xl hover:shadow-pink-500/20 transition-all">
              <p className="text-gray-300 italic mb-6 text-lg">
                “Me encantó el servicio. El corte fue justo como lo quería y el ambiente es súper agradable.”
              </p>
              <div className="flex justify-center gap-1 text-yellow-400 mb-2 text-xl">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <h4 className="font-bold text-white text-xl">María G.</h4>
              <p className="text-gray-500 text-sm">Cliente frecuente</p>
            </div>
          </SwiperSlide>

          {/* Testimonio 2 */}
          <SwiperSlide>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-10 shadow-2xl hover:shadow-pink-500/20 transition-all">
              <p className="text-gray-300 italic mb-6 text-lg">
                “La atención fue increíble y el maquillaje quedó espectacular. 100% recomendado 💄.”
              </p>
              <div className="flex justify-center gap-1 text-yellow-400 mb-2 text-xl">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <h4 className="font-bold text-white text-xl">Camila R.</h4>
              <p className="text-gray-500 text-sm">Evento de boda</p>
            </div>
          </SwiperSlide>

          {/* Testimonio 3 */}
          <SwiperSlide>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-10 shadow-2xl hover:shadow-pink-500/20 transition-all">
              <p className="text-gray-300 italic mb-6 text-lg">
                “Excelente barbería, muy profesionales. Salí con el mejor fade que me han hecho 🔥.”
              </p>
              <div className="flex justify-center gap-1 text-yellow-400 mb-2 text-xl">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <h4 className="font-bold text-white text-xl">Juan P.</h4>
              <p className="text-gray-500 text-sm">Cliente nuevo</p>
            </div>
          </SwiperSlide>

          {/* Testimonio 4 */}
          <SwiperSlide>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-10 shadow-2xl hover:shadow-pink-500/20 transition-all">
              <p className="text-gray-300 italic mb-6 text-lg">
                “Increíble experiencia, el personal muy amable y el lugar impecable. Volveré pronto 😍.”
              </p>
              <div className="flex justify-center gap-1 text-yellow-400 mb-2 text-xl">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <h4 className="font-bold text-white text-xl">Laura T.</h4>
              <p className="text-gray-500 text-sm">Cliente regular</p>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* CTA Final */}
        <div className="mt-16">
          <a
            href="/reservar"
            className="inline-block bg-gradient-to-r from-pink-500 to-orange-400 text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            ¡Únete a nuestros clientes felices!
          </a>
        </div>
      </div>
    </section>



    </main>
  );
}
"use client";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="contacto" className="bg-gradient-to-r from-slate-950 to-slate-900 text-gray-300 py-14 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
        
        {/* Logo y descripción */}
        <div className="flex flex-col items-center">
          <h3 className="text-3xl font-bold mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Salon</span>
            <span className="text-yellow-400">Click</span>
          </h3>
          <p className="text-gray-400 leading-relaxed max-w-xs">
            Transformamos tu look con estilo, pasión y profesionalismo.  
            Vive la experiencia de belleza que mereces. ✨
          </p>
        </div>

        {/* Información de contacto */}
        <div className="flex flex-col items-center">
          <h4 className="text-lg font-semibold text-yellow-400 mb-3">Contáctanos</h4>
          <div className="space-y-3 text-gray-300">
            <p className="flex items-center justify-center gap-2">
              <FaPhoneAlt className="text-pink-400" /> +57 300 123 4567
            </p>
            <p className="flex items-center justify-center gap-2">
              <FaEnvelope className="text-pink-400" /> info@salonclick.com
            </p>
            <p className="flex items-center justify-center gap-2">
              <FaMapMarkerAlt className="text-pink-400" /> Florencia, Colombia
            </p>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="flex flex-col items-center">
          <h4 className="text-lg font-semibold text-yellow-400 mb-4">Síguenos</h4>
          <div className="flex justify-center gap-6 text-xl">
            <a href="#" className="hover:text-pink-400 transition-colors"><FaFacebookF /></a>
            <a href="#" className="hover:text-pink-400 transition-colors"><FaInstagram /></a>
            <a href="#" className="hover:text-pink-400 transition-colors"><FaTiktok /></a>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="text-center mt-12 border-t border-slate-800 pt-6 text-gray-500 text-sm">
        <p>© 2025 SalonClick. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

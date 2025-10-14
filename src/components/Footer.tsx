"use client";

import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTiktok,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      id="contacto"
      className="border-t border-slate-800 bg-gradient-to-r from-slate-950 to-slate-900 py-14 text-gray-300"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 text-center md:grid-cols-3">
        <div className="flex flex-col items-center">
          <h3 className="mb-3 text-3xl font-bold">
            <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
              Salon
            </span>
            <span className="text-yellow-400">Click</span>
          </h3>
          <p className="max-w-xs text-sm text-gray-400">
            Transformamos tu look con estilo, pasion y profesionalismo. Vive la experiencia de
            belleza que mereces.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="mb-3 text-lg font-semibold text-yellow-400">Contactanos</h4>
          <div className="space-y-3 text-sm text-gray-300">
            <p className="flex items-center justify-center gap-2">
              <FaPhoneAlt className="text-pink-400" />
              +57 300 123 4567
            </p>
            <p className="flex items-center justify-center gap-2">
              <FaEnvelope className="text-pink-400" />
              info@salonclick.com
            </p>
            <p className="flex items-center justify-center gap-2">
              <FaMapMarkerAlt className="text-pink-400" />
              Florencia, Colombia
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="mb-4 text-lg font-semibold text-yellow-400">Siguenos</h4>
          <div className="flex justify-center gap-6 text-xl">
            <a href="#" className="transition hover:text-pink-400" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" className="transition hover:text-pink-400" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="transition hover:text-pink-400" aria-label="TikTok">
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-gray-500">
        <p>(c) 2025 SalonClick. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <footer className="bg-purple-900 text-white py-8 mt-10">
      <div className="max-w-6xl mx-auto flex justify-between flex-wrap">
        <div>
          <h3 className="text-2xl font-bold">
            <span className="text-pink-500">Salon</span>Click
          </h3>
          <p>Tu estilo, tu tiempo</p>
        </div>
        <div>
          <h4 className="font-semibold">Contacto</h4>
          <p>+57 300 123 4567</p>
          <p>info@salonclick.com</p>
          <p>Bogotá, Colombia</p>
        </div>
        <div>
          <h4 className="font-semibold">Enlaces</h4>
          <a href="#inicio" className="block hover:text-pink-400">Inicio</a>
          <a href="#servicios" className="block hover:text-pink-400">Servicios</a>
          <a href="#reservar" className="block hover:text-pink-400">Reservar</a>
          <a href="#contacto" className="block hover:text-pink-400">Contacto</a>
        </div>
      </div>
      <div className="text-center mt-6 border-t border-gray-700 pt-4">
        <p>© 2025 SalonClick. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

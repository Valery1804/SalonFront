"use client";

import { useState } from "react";
import { FiPlus, FiEdit3, FiTrash2, FiClock, FiDollarSign, FiUsers, FiSearch } from "react-icons/fi";
import { FaCut, FaPaintBrush, FaHandSparkles, FaUserTie } from "react-icons/fa";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: "corte" | "color" | "manicure" | "maquillaje" | "barba" | "tratamiento";
  isActive: boolean;
  providerTypes: string[];
}

// Datos de ejemplo
const mockServices: Service[] = [
  {
    id: "1",
    name: "Corte de cabello masculino",
    description: "Corte clásico y moderno para hombres",
    duration: 30,
    price: 25000,
    category: "corte",
    isActive: true,
    providerTypes: ["barbero", "estilista"]
  },
  {
    id: "2",
    name: "Corte y peinado femenino",
    description: "Corte y peinado personalizado para mujeres",
    duration: 60,
    price: 45000,
    category: "corte",
    isActive: true,
    providerTypes: ["estilista"]
  },
  {
    id: "3",
    name: "Tinte completo",
    description: "Coloración completa del cabello",
    duration: 120,
    price: 80000,
    category: "color",
    isActive: true,
    providerTypes: ["estilista"]
  },
  {
    id: "4",
    name: "Manicure clásica",
    description: "Manicure tradicional con esmaltado",
    duration: 45,
    price: 20000,
    category: "manicure",
    isActive: true,
    providerTypes: ["manicurista"]
  },
  {
    id: "5",
    name: "Maquillaje social",
    description: "Maquillaje para eventos sociales",
    duration: 60,
    price: 60000,
    category: "maquillaje",
    isActive: true,
    providerTypes: ["maquilladora"]
  },
  {
    id: "6",
    name: "Arreglo de barba",
    description: "Recorte y arreglo de barba",
    duration: 20,
    price: 15000,
    category: "barba",
    isActive: false,
    providerTypes: ["barbero"]
  }
];

const categories = [
  { key: "corte", label: "Cortes", icon: <FaCut className="text-blue-500" />, color: "blue" },
  { key: "color", label: "Coloración", icon: <FaPaintBrush className="text-purple-500" />, color: "purple" },
  { key: "manicure", label: "Manicure", icon: <FaHandSparkles className="text-pink-500" />, color: "pink" },
  { key: "maquillaje", label: "Maquillaje", icon: <FaPaintBrush className="text-orange-500" />, color: "orange" },
  { key: "barba", label: "Barbería", icon: <FaUserTie className="text-green-500" />, color: "green" },
  { key: "tratamiento", label: "Tratamientos", icon: <FaCut className="text-indigo-500" />, color: "indigo" }
];

export default function AdminServicios() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryInfo = (categoryKey: string) => {
    return categories.find(cat => cat.key === categoryKey) || categories[0];
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive }
        : service
    ));
  };

  const deleteService = (serviceId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      setServices(prev => prev.filter(service => service.id !== serviceId));
    }
  };

  const activeServicesCount = services.filter(s => s.isActive).length;
  const totalRevenue = services.reduce((sum, s) => s.isActive ? sum + s.price : sum, 0);
  const avgDuration = services.length > 0 
    ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
            Gestión de Servicios
          </h1>
          <p className="text-gray-300 text-lg">Administra los servicios que ofrece tu salón</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <FiUsers className="text-blue-400 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{activeServicesCount}</div>
            <div className="text-gray-400 text-sm">Servicios activos</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <FiDollarSign className="text-green-400 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{formatCurrency(totalRevenue)}</div>
            <div className="text-gray-400 text-sm">Valor total servicios</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <FiClock className="text-orange-400 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{avgDuration}min</div>
            <div className="text-gray-400 text-sm">Duración promedio</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <FiUsers className="text-purple-400 text-2xl" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{categories.length}</div>
            <div className="text-gray-400 text-sm">Categorías</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.key} value={category.key}>{category.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center gap-2"
          >
            <FiPlus /> Nuevo Servicio
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const categoryInfo = getCategoryInfo(service.category);
            return (
              <div key={service.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-pink-500/50 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {categoryInfo.icon}
                    <div>
                      <h3 className="text-white font-semibold text-lg">{service.name}</h3>
                      <span className="text-gray-400 text-sm">{categoryInfo.label}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    service.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {service.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4">{service.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <FiClock className="text-xs" /> Duración:
                    </span>
                    <span className="text-white">{service.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <FiDollarSign className="text-xs" /> Precio:
                    </span>
                    <span className="text-white font-semibold">{formatCurrency(service.price)}</span>
                  </div>
                </div>

                {/* Provider Types */}
                <div className="mb-4">
                  <div className="text-gray-400 text-xs mb-1">Especialistas:</div>
                  <div className="flex flex-wrap gap-1">
                    {service.providerTypes.map(type => (
                      <span key={type} className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleServiceStatus(service.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      service.isActive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {service.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors">
                    <FiEdit3 className="text-sm" />
                  </button>
                  <button 
                    onClick={() => deleteService(service.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No se encontraron servicios</div>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}

        {/* Add Service Modal Placeholder */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Nuevo Servicio</h3>
              <p className="text-gray-300 mb-4">Funcionalidad de agregar servicio en desarrollo...</p>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

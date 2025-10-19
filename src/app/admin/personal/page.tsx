"use client";
import { useEffect, useState } from "react";
import { FaUserTie, FaPaintBrush, FaCut, FaHandSparkles } from "react-icons/fa";
import { getAllUsers, updateUser } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import type { ProviderType, User } from "@/types/user";

const personal = [
  {
    nombre: "Barbero",
    tipo: "barbero" as ProviderType,
    icono: <FaUserTie className="text-4xl text-blue-500" />,
    servicios: ["Corte de cabello", "Barba", "Afeitado"],
  },
  {
    nombre: "Maquilladora",
    tipo: "maquilladora" as ProviderType,
    icono: <FaPaintBrush className="text-4xl text-pink-500" />,
    servicios: ["Maquillaje social", "Maquillaje de novia"],
  },
  {
    nombre: "Estilista",
    tipo: "estilista" as ProviderType,
    icono: <FaCut className="text-4xl text-orange-500" />,
    servicios: ["Peinados", "Coloracion", "Tratamientos"],
  },
  {
    nombre: "Manicurista",
    tipo: "manicurista" as ProviderType,
    icono: <FaHandSparkles className="text-4xl text-green-500" />,
    servicios: ["Manicure", "Pedicure", "Unas acrilicas"],
  },
];

export default function AdminPersonalSalon() {
  const [selected, setSelected] = useState<ProviderType | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Cargar todos los usuarios al inicio
  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);
    setError(null);

    getAllUsers()
      .then((data) => {
        if (!isMounted) return;
        setAllUsers(data);
        console.log('Usuarios cargados:', data);
        console.log('Usuarios con providerType:', data.filter(u => u.providerType));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
        console.error('Error cargando usuarios:', err);
      })
      .finally(() => {
        if (!isMounted) return;
        setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtrar usuarios cuando cambia la selección
  useEffect(() => {
    if (!selected) {
      setUsers([]);
      return;
    }

    setLoading(true);
    const filteredUsers = allUsers.filter((user) => user.providerType === selected);
    setUsers(filteredUsers);
    console.log(`Usuarios filtrados para ${selected}:`, filteredUsers);
    setLoading(false);
  }, [selected, allUsers]);

  const handleToggleActive = async (user: User) => {
    const action = user.isActive ? "deshabilitar" : "habilitar";
    const confirmMsg = `Estas seguro de ${action} la cuenta de ${user.fullName}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateUser(user.id, { isActive: !user.isActive });
      setUsers((prev) =>
        prev.map((current) =>
          current.id === user.id ? { ...current, isActive: !current.isActive } : current,
        ),
      );
    } catch (err: unknown) {
      alert(getErrorMessage(err, "No se pudo actualizar el estado del usuario"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
          Personal del Salón
        </h1>
        {/* Loading inicial */}
        {initialLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400">Cargando personal...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-400">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {!initialLoading && !error && !selected && (
          <>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <p className="text-gray-300 text-lg">Gestiona el personal de tu salón por especialidad</p>
                <p className="text-gray-500 text-sm mt-1">
                  Total de usuarios: {allUsers.length} | Con especialidad: {allUsers.filter(u => u.providerType).length}
                </p>
              </div>
              <a
                href="/admin/personal/agregar"
                className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition-all"
              >
                Agregar personal
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {personal.map((perfil) => {
                const userCount = allUsers.filter(u => u.providerType === perfil.tipo).length;
                return (
                  <button
                    key={perfil.nombre}
                    className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col items-center hover:border-pink-500/50 hover:scale-105 transition-all cursor-pointer relative"
                    onClick={() => setSelected(perfil.tipo)}
                  >
                    {userCount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {userCount}
                      </div>
                    )}
                    {perfil.icono}
                    <h2 className="text-xl font-bold mt-4 mb-2 text-white">{perfil.nombre}</h2>
                    <ul className="text-gray-300 text-sm list-disc pl-5">
                      {perfil.servicios.map((servicio) => (
                        <li key={servicio}>{servicio}</li>
                      ))}
                    </ul>
                    <div className="mt-2 text-xs text-gray-400">
                      {userCount} {userCount === 1 ? 'persona' : 'personas'}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {!initialLoading && !error && selected && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {personal.find((perfil) => perfil.tipo === selected)?.nombre}
              </h2>
              <button 
                className="text-pink-400 hover:text-pink-300 underline transition-colors" 
                onClick={() => setSelected(null)}
              >
                ← Volver
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Filtrando personal...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No hay personal registrado para esta especialidad.</div>
                <p className="text-gray-500 text-sm">
                  Total de usuarios en el sistema: {allUsers.length}
                </p>
                <p className="text-gray-500 text-sm">
                  Usuarios con especialidad {selected}: {users.length}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-slate-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{user.fullName}</h3>
                      <p className="text-gray-300 text-sm">{user.email}</p>
                      {user.phone && <p className="text-gray-400 text-sm">{user.phone}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <button
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          user.isActive
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.isActive ? "Deshabilitar" : "Habilitar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
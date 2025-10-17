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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) {
      setUsers([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getAllUsers()
      .then((data) => {
        if (!isMounted) return;
        setUsers(data.filter((user) => user.providerType === selected));
      })
      .catch(() => {
        if (!isMounted) return;
        setUsers([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selected]);

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
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-pink-100 to-green-100 py-10">
      <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">
        Personal del Salon
      </h1>
      {!selected ? (
        <>
          <div className="mb-8 w-full max-w-3xl flex justify-end">
            <a
              href="/admin/personal/agregar"
              className="bg-pink-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-pink-400 transition-all"
            >
              Agregar personal
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
            {personal.map((perfil) => (
              <button
                key={perfil.nombre}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-yellow-200 hover:scale-105 transition-all cursor-pointer"
                onClick={() => setSelected(perfil.tipo)}
              >
                {perfil.icono}
                <h2 className="text-xl font-bold mt-4 mb-2 text-gray-800">{perfil.nombre}</h2>
                <ul className="text-gray-600 text-base list-disc pl-5">
                  {perfil.servicios.map((servicio) => (
                    <li key={servicio}>{servicio}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <button className="mb-4 text-pink-500 underline" onClick={() => setSelected(null)}>
            Volver
          </button>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {personal.find((perfil) => perfil.tipo === selected)?.nombre}
          </h2>
          {loading ? (
            <div className="text-gray-400">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="text-gray-400">No hay personal registrado.</div>
          ) : (
            <ul className="w-full">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="border-b border-gray-200 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <span className="font-semibold text-pink-600">{user.fullName}</span>
                  <span className="text-gray-500 text-sm">{user.email}</span>
                  <span className="text-gray-500 text-sm">{user.phone}</span>
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${user.isActive ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.isActive ? "Deshabilitar" : "Habilitar"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
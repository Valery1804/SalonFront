"use client";
import { FaUserTie, FaPaintBrush, FaCut, FaHandSparkles } from "react-icons/fa";
import { useState, useEffect } from "react";
import { getAllUsers, updateUser } from "@/service/userService";
import type { User } from "@/types/user";

const personal = [
  { nombre: "Barbero", tipo: "barbero", icono: <FaUserTie className="text-4xl text-blue-500" />, servicios: ["Corte de cabello", "Barba", "Afeitado"] },
  { nombre: "Maquilladora", tipo: "maquilladora", icono: <FaPaintBrush className="text-4xl text-pink-500" />, servicios: ["Maquillaje social", "Maquillaje de novia"] },
  { nombre: "Estilista", tipo: "estilista", icono: <FaCut className="text-4xl text-orange-500" />, servicios: ["Peinados", "Coloración", "Tratamientos"] },
  { nombre: "Manicurista", tipo: "manicurista", icono: <FaHandSparkles className="text-4xl text-green-500" />, servicios: ["Manicure", "Pedicure", "Uñas acrílicas"] },
];

export default function AdminPersonalSalon() {
  const handleToggleActive = async (user: any) => {
    const action = user.isActive ? "deshabilitar" : "habilitar";
    const confirmMsg = `¿Seguro que deseas ${action} la cuenta de ${user.fullName}?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      setUsers((prev: any[]) =>
        prev.map((u: any) =>
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (err) {
      alert("No se pudo actualizar el estado del usuario");
    }
  };


  const [selected, setSelected] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected) {
      setLoading(true);
      getAllUsers()
        .then((data) => {
          setUsers(data.filter((u: User) => u.providerType === selected));
        })
        .finally(() => setLoading(false));
    }
  }, [selected]);


  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-pink-100 to-green-100 py-10">
      <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">Personal del Salón</h1>
      {!selected ? (
        <>
          <div className="mb-8 w-full max-w-3xl flex justify-end">
            <a href="/admin/personal/agregar" className="bg-pink-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-pink-400 transition-all">Agregar personal</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
            {personal.map((p) => (
              <button
                key={p.nombre}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-yellow-200 hover:scale-105 transition-all cursor-pointer"
                onClick={() => setSelected(p.tipo)}
              >
                {p.icono}
                <h2 className="text-xl font-bold mt-4 mb-2 text-gray-800">{p.nombre}</h2>
                <ul className="text-gray-600 text-base list-disc pl-5">
                  {p.servicios.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <button className="mb-4 text-pink-500 underline" onClick={() => setSelected(null)}>
            ← Volver
          </button>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {personal.find((p) => p.tipo === selected)?.nombre}
          </h2>
          {loading ? (
            <div className="text-gray-400">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="text-gray-400">No hay personal registrado.</div>
          ) : (
            <ul className="w-full">
              {users.map((u) => (
                <li key={u.id} className="border-b border-gray-200 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <span className="font-semibold text-pink-600">{u.fullName}</span>
                  <span className="text-gray-500 text-sm">{u.email}</span>
                  <span className="text-gray-500 text-sm">{u.phone}</span>
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${u.isActive ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                    onClick={() => handleToggleActive(u)}
                  >
                    {u.isActive ? "Deshabilitar" : "Habilitar"}
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


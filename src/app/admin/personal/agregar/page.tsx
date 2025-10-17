"use client";
import { useState } from "react";
import { createUser } from "@/service/userService";
import type { UserRole, ProviderType, User } from "@/types/user";

const roles = [
  { value: "prestador_servicio", label: "Prestador de servicio" },
  { value: "admin", label: "Administrador" },
];
const providerTypes = [
  { value: "barbero", label: "Barbero" },
  { value: "maquilladora", label: "Maquilladora" },
  { value: "estilista", label: "Estilista" },
  { value: "manicurista", label: "Manicurista" },
];

export default function AgregarPersonal() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "prestador_servicio",
    providerType: "barbero",
  });
  const [loading, setLoading] = useState(false);
  // Mensajes eliminados para evitar warnings y errores

  const handleChange = (e: any) => {
  setForm({ ...form, [e.target.name]: e.target.value }); // Puedes tipar e como React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  };

  const handleSubmit = async (e: any) => {
  e.preventDefault(); // Puedes tipar e como React.FormEvent<HTMLFormElement>
  setLoading(true);
    try {
      await createUser({
        ...form,
        role: form.role as UserRole,
        providerType: form.providerType as ProviderType,
      });
      setSuccess("Personal registrado exitosamente");
      setForm({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "prestador_servicio",
        providerType: "barbero",
      });
      setTimeout(() => {
        window.location.href = "/admin/personal";
      }, 1200);
    } catch (err: any) {
  // Puedes mostrar el error con alert si lo necesitas
  alert("No se pudo registrar el personal");
    } finally {
  setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-pink-100 to-green-100 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-0 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-pink-500 to-orange-400 p-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Agregar Personal</h1>
          <p className="text-pink-100 text-base">Registra nuevos miembros del equipo y asigna su rol y especialidad.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="firstName" type="text" required placeholder="Nombre" value={form.firstName} onChange={handleChange} className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
            <input name="lastName" type="text" required placeholder="Apellido" value={form.lastName} onChange={handleChange} className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
          </div>
          <input name="email" type="email" required placeholder="Correo electrónico" value={form.email} onChange={handleChange} className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
          <input name="phone" type="text" required placeholder="Teléfono" value={form.phone} onChange={handleChange} className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
          <input name="password" type="password" required placeholder="Contraseña" value={form.password} onChange={handleChange} className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-pink-600">Rol</label>
              <select name="role" value={form.role} onChange={handleChange} className="border rounded-xl px-4 py-3 w-full bg-white text-pink-800 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all">
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-pink-600">Especialidad</label>
              <select name="providerType" value={form.providerType} onChange={handleChange} className="border rounded-xl px-4 py-3 w-full bg-white text-pink-800 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all">
                {providerTypes.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">
            {loading ? "Registrando..." : "Registrar Personal"}
          </button>
        </form>
      </div>
    </div>
  );
}

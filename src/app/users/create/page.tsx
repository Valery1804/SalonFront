"use client";

import { useState } from "react";
import { createUser } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import type { UserRole } from "@/types/user";

interface CreateUserForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
}

export default function CreateUserPage() {
  const [form, setForm] = useState<CreateUserForm>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "cliente",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "role" ? (value as UserRole) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const newUser = await createUser(form);
      setMessage(`Usuario ${newUser.fullName} creado exitosamente.`);
      setForm({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "cliente",
      });
    } catch (error: unknown) {
      setError(getErrorMessage(error, "No se pudo crear el usuario"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="bg-white text-black rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-purple-800 mb-6">
          Crear Nuevo Usuario
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="firstName"
            placeholder="Nombre"
            value={form.firstName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600"
          />
          <input
            name="lastName"
            placeholder="Apellido"
            value={form.lastName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600"
          />
          <input
            name="phone"
            placeholder="Teléfono"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600"
          >
            <option value="cliente">Cliente</option>
            <option value="admin">Administrador</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 rounded-full hover:bg-pink-500 transition-colors font-semibold"
          >
            {loading ? "Creando..." : "Crear Usuario"}
          </button>
        </form>

        {message && <p className="text-green-600 text-center mt-4">{message}</p>}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}

"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { createUser } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import type { ProviderType, UserRole } from "@/types/user";

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

type FormState = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  providerType: ProviderType;
};

const initialFormState: FormState = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  role: "prestador_servicio",
  providerType: "barbero",
};

type TextFieldName = Exclude<keyof FormState, "role" | "providerType">;
type FormFieldEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement>;

export default function AgregarPersonal() {
  const [form, setForm] = useState<FormState>({ ...initialFormState });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (event: FormFieldEvent) => {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "role") {
        return { ...prev, role: value as UserRole };
      }

      if (name === "providerType") {
        return { ...prev, providerType: value as ProviderType };
      }

      return {
        ...prev,
        [name as TextFieldName]: value,
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await createUser(form);
      setSuccess("Personal registrado exitosamente");
      setForm({ ...initialFormState });
      window.setTimeout(() => {
        window.location.href = "/admin/personal";
      }, 1200);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo registrar el personal"));
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
            <input
              name="firstName"
              type="text"
              required
              placeholder="Nombre"
              value={form.firstName}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
            />
            <input
              name="lastName"
              type="text"
              required
              placeholder="Apellido"
              value={form.lastName}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
            />
          </div>
          <input
            name="email"
            type="email"
            required
            placeholder="Correo electronico"
            value={form.email}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
          />
          <input
            name="phone"
            type="text"
            required
            placeholder="Telefono"
            value={form.phone}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Contrasena"
            value={form.password}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3 bg-white text-pink-800 placeholder-pink-700 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-pink-600">Rol</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border rounded-xl px-4 py-3 w-full bg-white text-pink-800 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-pink-600">Especialidad</label>
              <select
                name="providerType"
                value={form.providerType}
                onChange={handleChange}
                className="border rounded-xl px-4 py-3 w-full bg-white text-pink-800 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              >
                {providerTypes.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600"
            >
              {error}
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-600"
            >
              {success}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
          >
            {loading ? "Registrando..." : "Registrar Personal"}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { createUser } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import type { UserRole } from "@/types/user";
import PasswordRequirements, { usePasswordValidation } from "@/components/ui/PasswordRequirements";

interface CreateUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
}

export default function CreateUserPage() {
  const [form, setForm] = useState<CreateUserForm>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "cliente",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { isValid: isPasswordValid } = usePasswordValidation(form.password);
  const { isValid: isConfirmPasswordValid } = usePasswordValidation(form.confirmPassword);

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

    // Validar que la contraseña cumpla con los requisitos
    if (!isPasswordValid) {
      setError("La contraseña no cumple con los requisitos de complejidad");
      setLoading(false);
      return;
    }

    // Validar que la confirmación también cumpla con los requisitos
    if (!isConfirmPasswordValid) {
      setError("La confirmación de contraseña no cumple con los requisitos de complejidad");
      setLoading(false);
      return;
    }

    // Validar que las contraseñas coincidan
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      // Enviar solo los campos necesarios (sin confirmPassword)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userData } = form;
      const newUser = await createUser(userData);
      setMessage(`Usuario ${newUser.fullName} creado exitosamente.`);
      setForm({
        email: "",
        password: "",
        confirmPassword: "",
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

          {form.password && (
            <div className="my-4">
              <PasswordRequirements password={form.password} className="bg-purple-50 border-purple-200" />
            </div>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600"
          />

          {form.confirmPassword && (
            <div className="space-y-3">
              <PasswordRequirements password={form.confirmPassword} className="bg-purple-50 border-purple-200" />
              {form.password && form.confirmPassword && (
                <div
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                    form.password === form.confirmPassword
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-orange-400 bg-orange-50 text-orange-700"
                  }`}
                >
                  <span className="text-lg">
                    {form.password === form.confirmPassword ? "✓" : "✗"}
                  </span>
                  <span>
                    {form.password === form.confirmPassword
                      ? "Las contraseñas coinciden"
                      : "Las contraseñas no coinciden"}
                  </span>
                </div>
              )}
            </div>
          )}

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
            disabled={loading || !isPasswordValid || !isConfirmPasswordValid || form.password !== form.confirmPassword}
            className="w-full bg-pink-600 text-white py-3 rounded-full hover:bg-pink-500 transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
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

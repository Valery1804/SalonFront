"use client";

import { register } from "@/service/authService";
import { useState } from "react";
import { getErrorMessage } from "@/utils/error";
import { useAuth } from "@/providers/AuthProvider";

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const fields: Array<keyof RegisterForm> = [
  "email",
  "password",
  "confirmPassword",
  "firstName",
  "lastName",
  "phone",
];

const fieldLabels: Record<keyof RegisterForm, string> = {
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm Password",
  firstName: "Nombre",
  lastName: "Apellido",
  phone: "Telefono",
};

export default function Register() {
  const { setSession } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof RegisterForm;
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(form);
      setSession(data);
      alert(`Usuario registrado: ${data.user.fullName}`);
      window.location.href = "/";
    } catch (error: unknown) {
      setError(getErrorMessage(error, "No se pudo registrar el usuario"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-700 to-orange-700 py-12 px-4">
      <div className="bg-white text-black rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-pink-700 mb-6">
          Crear cuenta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field}>
              <label className="block font-semibold mb-2">{fieldLabels[field]}</label>
              <input
                name={field}
                type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-600"
              />
            </div>
          ))}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all font-semibold"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { register } from "@/service/authService";
import { getErrorMessage } from "@/utils/error";
import PasswordRequirements, { usePasswordValidation } from "@/components/ui/PasswordRequirements";

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
  const router = useRouter();
  const { setSession } = useAuth();
  const { showToast } = useToast();
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
  const { isValid: isPasswordValid } = usePasswordValidation(form.password);
  const { isValid: isConfirmPasswordValid } = usePasswordValidation(form.confirmPassword);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const key = name as keyof RegisterForm;
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

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

    // Validar formato de teléfono si se proporciona
    if (form.phone && !/^\+?[1-9]\d{1,14}$/.test(form.phone)) {
      setError("El formato del teléfono no es válido. Ejemplo: +1234567890");
      setLoading(false);
      return;
    }

    try {
      const data = await register(form);
      setSession(data);
      showToast({
        variant: "success",
        title: "Cuenta creada",
        description: `Bienvenido/a ${data.user.fullName ?? data.user.email}`,
      });
      router.replace("/");
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No se pudo registrar el usuario"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60";

  return (
    <AuthLayout
      heroTitle="Crea tu cuenta en minutos"
      heroSubtitle="Gestiona citas, descubre profesionales y comparte resenas desde un mismo lugar."
      heroDescription="Con tu cuenta podras reservar experiencias, administrar servicios si eres prestador y recibir notificaciones personalizadas."
      footer={
        <p className="text-center text-sm">
          Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-pink-300 transition hover:text-orange-200"
          >
            Inicia sesion
          </Link>
        </p>
      }
    >
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-semibold text-white">Crear cuenta</h2>
        <p className="mt-2 text-sm text-gray-300">
          Completa tus datos para empezar a reservar o administrar tus servicios.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field} className="space-y-2">
            <label htmlFor={field} className="block text-sm font-medium text-gray-200">
              {fieldLabels[field]}
            </label>
            <input
              id={field}
              name={field}
              type={field === "email" ? "email" : "text"}
              value={form[field]}
              onChange={handleChange}
              required={field !== "phone"}
              className={inputClass}
            />
          </div>
        ))}

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-200">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {form.password && (
          <PasswordRequirements password={form.password} />
        )}

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {form.confirmPassword && (
          <div className="space-y-2">
            <PasswordRequirements password={form.confirmPassword} />
            {form.password && form.confirmPassword && (
              <div
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                  form.password === form.confirmPassword
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                    : "border-orange-400/40 bg-orange-500/10 text-orange-200"
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

        {error ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !isPasswordValid || !isConfirmPasswordValid || form.password !== form.confirmPassword}
          className="w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </AuthLayout>
  );
}

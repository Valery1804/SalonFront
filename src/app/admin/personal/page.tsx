"use client";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/ToastProvider";
import { createUser } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import type { ProviderType, UserRole } from "@/types/user";
import PasswordRequirements, { usePasswordValidation } from "@/components/ui/PasswordRequirements";

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
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  providerType: ProviderType;
  profileImage: string;
};

const initialFormState: FormState = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  role: "prestador_servicio",
  providerType: "barbero",
  profileImage: "",
};

type TextFieldName = Exclude<keyof FormState, "role" | "providerType" | "profileImage">;
type FormFieldEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement>;

export default function AgregarPersonal() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>({ ...initialFormState });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { isValid: isPasswordValid } = usePasswordValidation(form.password);
  const { isValid: isConfirmPasswordValid } = usePasswordValidation(form.confirmPassword);

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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreview("");
      setForm((prev) => ({ ...prev, profileImage: "" }));
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("La imagen no debe superar los 5MB");
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setForm((prev) => ({ ...prev, profileImage: base64String }));
    };
    reader.onerror = () => {
      setError("Error al leer la imagen");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
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

    try {
      // Enviar solo los campos necesarios (sin confirmPassword)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userData } = form;
      await createUser(userData);
      setSuccess("Personal registrado exitosamente");
      setForm({ ...initialFormState });
      setImagePreview("");
      showToast({
        variant: "success",
        title: "Nuevo integrante agregado",
        description: "El personal fue registrado correctamente.",
      });
      router.replace("/admin/personal");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo registrar el personal"));
    } finally {
  setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-white shadow-2xl backdrop-blur">
      <header className="mb-8 space-y-3 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.4em] text-pink-300">
          Alta de personal
        </p>
        <h1 className="text-3xl font-semibold">Registra nuevos especialistas</h1>
        <p className="text-sm text-white/70">
          Completa los datos esenciales para habilitar su acceso al panel administrativo y
          asignar su rol dentro del salón.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField label="Nombre">
            <input
              name="firstName"
              type="text"
              required
              value={form.firstName}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            />
          </LabeledField>
          <LabeledField label="Apellido">
            <input
              name="lastName"
              type="text"
              required
              value={form.lastName}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            />
          </LabeledField>
        </div>

        <LabeledField label="Correo electrónico">
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
          />
        </LabeledField>

        <LabeledField label="Teléfono">
          <input
            name="phone"
            type="text"
            required
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
          />
        </LabeledField>

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField label="Contraseña provisional">
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            />
          </LabeledField>
          <LabeledField label="Confirmar contraseña">
            <input
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            />
          </LabeledField>
        </div>

        {form.password && (
          <PasswordRequirements password={form.password} />
        )}

        {form.confirmPassword && (
          <div className="space-y-3">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField label="Rol">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </LabeledField>
          <LabeledField label="Especialidad">
            <select
              name="providerType"
              value={form.providerType}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            >
              {providerTypes.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </LabeledField>
        </div>

        <LabeledField label="Foto de perfil">
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-pink-500/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-pink-200 hover:file:bg-pink-500/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            />
            {imagePreview && (
              <div className="flex justify-center">
                <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-pink-400/30 shadow-lg">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-white/50">
              Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF, WebP
            </p>
          </div>
        </LabeledField>

        {error ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !isPasswordValid || !isConfirmPasswordValid || form.password !== form.confirmPassword}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Registrar personal"}
          </button>
        </div>
      </form>
    </section>
  );
}

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-white/80">
      <span className="text-xs uppercase tracking-[0.3em] text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}

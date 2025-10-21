"use client";
import { useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/providers/ToastProvider";
import { getUserById, updateUser } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import type { ProviderType, UserRole, User } from "@/types/user";

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
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  providerType: ProviderType;
  profileImage: string;
  isActive: boolean;
};

type TextFieldName = Exclude<keyof FormState, "role" | "providerType" | "profileImage" | "isActive">;
type FormFieldEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement>;

export default function EditarPersonal() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    phone: "",
    role: "prestador_servicio",
    providerType: "barbero",
    profileImage: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(userId);
        setUser(userData);
        setForm({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || "",
          role: userData.role,
          providerType: userData.providerType || "barbero",
          profileImage: userData.profileImage || "",
          isActive: userData.isActive,
        });
        if (userData.profileImage) {
          setImagePreview(userData.profileImage);
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err, "No se pudo cargar el usuario");
        setError(message);
        showToast({ variant: "error", description: message });
      } finally {
        setLoadingUser(false);
      }
    };

    void loadUser();
  }, [userId, showToast]);

  const handleChange = (event: FormFieldEvent) => {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "role") {
        return { ...prev, role: value as UserRole };
      }

      if (name === "providerType") {
        return { ...prev, providerType: value as ProviderType };
      }

      if (name === "isActive") {
        return { ...prev, isActive: (event.target as HTMLInputElement).checked };
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

  const handleRemoveImage = () => {
    setImagePreview("");
    setForm((prev) => ({ ...prev, profileImage: "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updated = await updateUser(userId, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        role: form.role,
        providerType: form.providerType,
        profileImage: form.profileImage || undefined,
        isActive: form.isActive,
      });
      showToast({
        variant: "success",
        title: "Usuario actualizado",
        description: "Los datos del personal fueron actualizados correctamente.",
      });
      router.push("/admin/personal");
    } catch (err: unknown) {
      const message = getErrorMessage(err, "No se pudo actualizar el usuario");
      setError(message);
      showToast({ variant: "error", description: message });
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <section className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-white shadow-2xl backdrop-blur">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-white/10" />
          <div className="h-4 w-96 rounded bg-white/10" />
          <div className="mt-8 space-y-4">
            <div className="h-12 rounded-xl bg-white/10" />
            <div className="h-12 rounded-xl bg-white/10" />
            <div className="h-12 rounded-xl bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  if (error && !user) {
    return (
      <section className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-white shadow-2xl backdrop-blur">
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-white shadow-2xl backdrop-blur">
      <header className="mb-8 space-y-3 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.4em] text-pink-300">
          Editar personal
        </p>
        <h1 className="text-3xl font-semibold">Actualizar información</h1>
        <p className="text-sm text-white/70">
          Modifica los datos del personal: {user?.fullName || user?.email}
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
            type="email"
            disabled
            value={user?.email}
            className="w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-white/50 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-white/40">El correo no se puede modificar</p>
        </LabeledField>

        <LabeledField label="Teléfono">
          <input
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
          />
        </LabeledField>

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
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-pink-400/30 shadow-lg">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-300 hover:text-red-200 transition"
                >
                  Eliminar imagen
                </button>
              </div>
            )}
            <p className="text-xs text-white/50">
              Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF, WebP
            </p>
          </div>
        </LabeledField>

        <LabeledField label="Estado">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-5 w-5 rounded border-white/20 bg-slate-950/60 text-pink-500 focus:ring-2 focus:ring-pink-400/50"
            />
            <span className="text-sm text-white">Usuario activo</span>
          </label>
        </LabeledField>

        {error ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
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
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Actualizando..." : "Guardar cambios"}
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

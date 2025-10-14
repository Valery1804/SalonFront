"use client";

import { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
  type UpdateProfileDTO,
  type UserResponse,
} from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import type { UserRole } from "@/types/user";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  emailVerificationToken: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "cliente",
    isActive: true,
    emailVerificationToken: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setUser(data);
        setFormData({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone ?? "",
          role: data.role,
          isActive: Boolean(data.isActive),
          emailVerificationToken: "",
        });
      } catch (caughtError: unknown) {
        setMessage(getErrorMessage(caughtError, "No se pudo obtener el perfil"));
      }
    };

    void fetchProfile();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    const { name } = target;

    let normalized: string | boolean = target.value;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      normalized = target.checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "role" && typeof normalized === "string"
          ? (normalized as UserRole)
          : normalized,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const updateData: UpdateProfileDTO = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      role: formData.role,
      isActive: formData.isActive,
      emailVerificationToken: formData.emailVerificationToken || undefined,
    };

    try {
      const updatedProfile = await updateMyProfile(updateData);
      setUser(updatedProfile);
      setMessage("Perfil actualizado exitosamente");
    } catch (caughtError: unknown) {
      setMessage(getErrorMessage(caughtError, "No se pudo actualizar el perfil"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="mt-10 text-center">Cargando perfil...</p>;
  }

  return (
    <div className="mx-auto mt-10 max-w-lg rounded bg-white p-6 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Mi Perfil</h1>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2"
        />
        <input
          type="text"
          name="firstName"
          placeholder="Nombre"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Apellido"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2"
        />
        <input
          type="text"
          name="phone"
          placeholder="Telefono"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2"
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2"
        >
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
          <option value="prestador_servicio">Prestador de servicio</option>
        </select>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <span>Activo</span>
        </label>
        <input
          type="text"
          name="emailVerificationToken"
          placeholder="Token de verificacion"
          value={formData.emailVerificationToken}
          onChange={handleChange}
          className="w-full rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Actualizando..." : "Actualizar Perfil"}
        </button>
      </form>
    </div>
  );
}

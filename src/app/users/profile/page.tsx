"use client";

import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile, UserResponse, UpdateProfileDTO } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "cliente" | "admin";
  isActive: boolean;
  emailVerificationToken: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "cliente",
    isActive: true,
    emailVerificationToken: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setUser(data);
        setFormData({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role === "admin" ? "admin" : "cliente",
          isActive: Boolean(data.isActive),
          emailVerificationToken: "",
        });
      } catch (error: unknown) {
        setMessage(getErrorMessage(error, "No se pudo obtener el perfil"));
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value } = target;

    const normalizedValue =
      target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const updateData: UpdateProfileDTO = { ...formData };

    try {
      const updated = await updateMyProfile(updateData);
      setUser(updated);
      setMessage("Perfil actualizado exitosamente");
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, "No se pudo actualizar el perfil"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded mt-10">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="firstName"
          placeholder="Nombre"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Apellido"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="phone"
          placeholder="Teléfono"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="cliente">Cliente</option>
          <option value="admin">Admin</option>
        </select>
        <label className="flex items-center space-x-2">
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
          placeholder="Token de verificación"
          value={formData.emailVerificationToken}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Actualizando..." : "Actualizar Perfil"}
        </button>
      </form>
    </div>
  );
}

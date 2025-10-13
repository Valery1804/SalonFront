"use client";

import { useState } from "react";
import { createService, type CreateServiceDTO } from "@/service/serviceService";
import { getErrorMessage } from "@/utils/error";
import { useAuth } from "@/providers/AuthProvider";

export default function CreateServicePage() {
  const [formData, setFormData] = useState<CreateServiceDTO>({
    name: "",
    description: "",
    price: 0,
    durationMinutes: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user, initializing } = useAuth();

  const isProvider = user?.role === "prestador_servicio";

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    let normalized: string | number | boolean = value;

    if (event.target instanceof HTMLInputElement) {
      if (event.target.type === "checkbox") {
        normalized = event.target.checked;
      } else if (event.target.type === "number") {
        normalized = Number(value);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: normalized,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await createService(formData);
      setMessage("Servicio creado exitosamente");
      setFormData({
        name: "",
        description: "",
        price: 0,
        durationMinutes: 0,
        isActive: true,
      });
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, "No se pudo crear el servicio"));
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded mt-10">
        <p className="text-gray-700">Cargando...</p>
      </div>
    );
  }

  if (!isProvider) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded mt-10">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Acceso restringido</h1>
        <p className="text-gray-600">
          Solo los usuarios con rol de prestador de servicio pueden crear servicios.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded mt-10 space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Crear Servicio</h1>
        <p className="text-gray-600 text-sm">
          Registra un nuevo servicio para ofrecerlo en tu agenda.
        </p>
      </header>

      {message && (
        <div className="rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nombre del servicio"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          required
        />
        <textarea
          name="description"
          placeholder="Descripción"
          value={formData.description}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={formData.price}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          min={0}
          required
        />
        <input
          type="number"
          name="durationMinutes"
          placeholder="Duración (minutos)"
          value={formData.durationMinutes}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          min={1}
          required
        />
        <label className="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <span>Activo</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Creando..." : "Crear Servicio"}
        </button>
      </form>
    </div>
  );
}

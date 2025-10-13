"use client";

import { useState } from "react";
import { createService, CreateServiceDTO } from "@/service/serviceService";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded mt-10">
      <h1 className="text-2xl font-bold mb-4">Crear Servicio</h1>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nombre del servicio"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Descripción"
          value={formData.description}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={formData.price}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="durationMinutes"
          placeholder="Duración (minutos)"
          value={formData.durationMinutes}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <span>Activo</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creando..." : "Crear Servicio"}
        </button>
      </form>
    </div>
  );
}

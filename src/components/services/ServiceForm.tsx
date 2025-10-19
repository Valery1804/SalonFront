"use client";

import { useEffect, useState } from "react";
import {
  createService,
  updateService,
  type CreateServiceDTO,
  type ServiceResponse,
} from "@/service/serviceService";
import { getErrorMessage } from "@/utils/error";

interface ServiceFormProps {
  service?: ServiceResponse;
  providerOptions?: Array<{ id: string; label: string }>;
  onCreated?: (service: ServiceResponse) => void;
  onUpdated?: (service: ServiceResponse) => void;
  onClose?: () => void;
}

const initialForm: CreateServiceDTO = {
  name: "",
  description: "",
  price: 0,
  durationMinutes: 0,
  isActive: true,
  providerId: null,
};

export default function ServiceForm({
  service,
  providerOptions,
  onCreated,
  onUpdated,
  onClose,
}: ServiceFormProps) {
  const [formData, setFormData] = useState<CreateServiceDTO>(
    service
      ? {
          name: service.name,
          description: service.description,
          price: service.price,
          durationMinutes: service.durationMinutes,
          isActive: service.isActive,
          providerId: service.providerId,
        }
      : initialForm,
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const isEditing = Boolean(service);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        isActive: service.isActive,
        providerId: service.providerId,
      });
    }
  }, [service]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    let normalized: string | number | boolean | null = value;

    if (event.target instanceof HTMLInputElement) {
      if (event.target.type === "checkbox") {
        normalized = event.target.checked;
      } else if (event.target.type === "number") {
        normalized = Number(value);
      }
    }

    if (name === "providerId") {
      normalized = value === "" ? null : value;
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
      if (isEditing && service) {
        const updated = await updateService(service.id, formData);
        setMessage("Servicio actualizado correctamente");
        onUpdated?.(updated);
      } else {
        const created = await createService(formData);
        setMessage("Servicio creado exitosamente");
        setFormData(initialForm);
        onCreated?.(created);
      }
      onClose?.();
    } catch (caughtError: unknown) {
      setMessage(
        getErrorMessage(
          caughtError,
          isEditing
            ? "No se pudo actualizar el servicio"
            : "No se pudo crear el servicio",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-gray-300">
          <span className="text-xs uppercase tracking-wider text-gray-400">Nombre</span>
          <input
            type="text"
            name="name"
            placeholder="Corte premium, maquillaje social..."
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-gray-300">
          <span className="text-xs uppercase tracking-wider text-gray-400">Precio (USD)</span>
          <input
            type="number"
            name="price"
            min={0}
            placeholder="Ej. 35"
            value={formData.price}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-gray-300">
          <span className="text-xs uppercase tracking-wider text-gray-400">Duracion (min)</span>
          <input
            type="number"
            name="durationMinutes"
            min={1}
            placeholder="Ej. 45"
            value={formData.durationMinutes}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
            required
          />
        </label>
        <label className="space-y-2 text-sm text-gray-300">
          <span className="text-xs uppercase tracking-wider text-gray-400">Estado</span>
          <span className="flex h-[52px] items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-gray-200">
            Activo
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 accent-pink-500"
            />
          </span>
        </label>
      </div>

      {providerOptions && providerOptions.length > 0 ? (
        <label className="space-y-2 text-sm text-gray-300">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            Profesional asignado
          </span>
          <select
            name="providerId"
            value={formData.providerId ?? ""}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
          >
            <option value="">Sin asignar</option>
            {providerOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="space-y-2 text-sm text-gray-300">
        <span className="text-xs uppercase tracking-wider text-gray-400">Descripcion</span>
        <textarea
          name="description"
          placeholder="Detalle la experiencia, productos utilizados y los beneficios del servicio."
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
          required
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 sm:w-auto"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-pink-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading
            ? "Guardando..."
            : isEditing
              ? "Actualizar servicio"
              : "Guardar servicio"}
        </button>
      </div>
    </form>
  );
}

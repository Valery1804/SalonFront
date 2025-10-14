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
      <section className="flex min-h-[60vh] items-center justify-center bg-slate-900">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-8 py-6 text-sm text-gray-300 shadow-lg">
          Cargando panel de servicios...
        </div>
      </section>
    );
  }

  if (!isProvider) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6">
        <div className="max-w-lg rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Acceso restringido</h1>
          <p className="mt-3 text-sm text-red-100">
            Necesitas un rol de <span className="font-semibold">prestador de servicio</span> para
            crear y administrar servicios. Si crees que es un error, contacta al administrador.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-pink-300">Panel del prestador</p>
            <h1 className="text-3xl font-bold text-white">Registrar un nuevo servicio</h1>
            <p className="text-sm text-gray-300">
              Completa la información clave para que tus clientes puedan encontrar y reservar este
              servicio desde la plataforma.
            </p>
          </header>

          {message && (
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-inner">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-400">Nombre</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Corte premium, maquillaje social..."
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-400">Precio (USD)</label>
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
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-400">Duración (min)</label>
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
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-400">Estado</label>
                <label className="flex h-[52px] items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-gray-200">
                  Activo
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 accent-pink-500"
                  />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-400">Descripción</label>
              <textarea
                name="description"
                placeholder="Detalle la experiencia, productos utilizados y los beneficios del servicio."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-pink-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creando servicio..." : "Guardar servicio"}
            </button>
          </form>
        </div>

        <aside className="flex-1 rounded-3xl border border-white/5 bg-white/5 p-8 text-sm text-slate-100 shadow-inner backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Sugerencias de descripción</h2>
          <p className="mt-2 text-gray-200">
            Sé específico sobre la experiencia que ofreces. Los clientes reservan más cuando comprenden
            qué recibirán y cuánto tiempo deben disponer.
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
              <h3 className="text-sm font-semibold text-pink-200">Tips rápidos</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-300">
                <li>Indica si el servicio incluye lavado, productos especiales o asesoría.</li>
                <li>Resalta el diferencial: técnica, productos premium o años de experiencia.</li>
                <li>Menciona requisitos previos o recomendaciones post-servicio.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
              <h3 className="text-sm font-semibold text-pink-200">Recuerda</h3>
              <p className="mt-1 text-xs text-gray-300">
                Los horarios disponibles se generan desde tu panel de&nbsp;
                <span className="font-semibold text-white">slots de agenda</span>. Después de crear el servicio, configura tu disponibilidad para que los clientes puedan reservarlo.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

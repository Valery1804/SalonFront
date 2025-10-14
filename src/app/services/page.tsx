"use client";

import { useEffect, useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useAuth } from "@/providers/AuthProvider";
import {
  getAllServices,
  updateService,
  type ServiceResponse,
} from "@/service/serviceService";
import Modal from "@/components/Modal";
import ServiceForm from "@/components/services/ServiceForm";
import { getErrorMessage } from "@/utils/error";

export default function ProviderServicesPage() {
  const { user, initializing } = useAuth();
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isProvider = user?.role === "prestador_servicio";

  useEffect(() => {
    if (!isProvider) {
      setServices([]);
      return;
    }

    const loadServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await getAllServices();
        const mine = all.filter((service) => service.providerId === user.id);
        setServices(mine);
      } catch (caughtError: unknown) {
        setError(getErrorMessage(caughtError, "No se pudieron cargar tus servicios"));
      } finally {
        setLoading(false);
      }
    };

    void loadServices();
  }, [isProvider, user?.id]);

  const toggleServiceStatus = async (service: ServiceResponse) => {
    setUpdatingId(service.id);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateService(service.id, { isActive: !service.isActive });
      setServices((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, isActive: updated.isActive } : item)),
      );
      setMessage(
        `Servicio ${updated.name} ${updated.isActive ? "activado" : "desactivado"} correctamente.`,
      );
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No se pudo actualizar el servicio"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleServiceCreated = () => {
    setModalOpen(false);
    setMessage("Servicio creado exitosamente.");
    // reload list
    if (!isProvider || !user) return;
    void (async () => {
      try {
        const all = await getAllServices();
        const mine = all.filter((service) => service.providerId === user.id);
        setServices(mine);
      } catch (caughtError: unknown) {
        setError(getErrorMessage(caughtError, "No se pudieron cargar tus servicios"));
      }
    })();
  };

  const sortedServices = useMemo(
    () =>
      [...services].sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0,
      ),
    [services],
  );

  if (initializing) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-slate-900">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-8 py-6 text-sm text-gray-300 shadow-lg">
          Cargando tus servicios...
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
            Necesitas un rol de prestador de servicio para administrar los servicios publicados.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 pb-16 pt-28 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-pink-300">Mis servicios</p>
            <h1 className="text-3xl font-bold">Portafolio publicado</h1>
            <p className="text-sm text-gray-300">
              Gestiona tu catalogo, activa o desactiva servicios y mantente alineado con tu oferta.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:shadow-pink-500/50"
          >
            Agregar nuevo servicio
          </button>
        </header>

        {message && (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : sortedServices.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-center text-sm text-gray-300">
            Aun no tienes servicios registrados. Usa el boton superior para agregar tu primera oferta.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedServices.map((service) => (
              <article
                key={service.id}
                className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl transition hover:border-pink-400/50"
              >
                <div className="space-y-3">
                  <header className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{service.name}</h2>
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        {service.durationMinutes} min
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        service.isActive
                          ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                          : "border border-orange-400/40 bg-orange-500/10 text-orange-200"
                      }`}
                    >
                      {service.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </header>
                  <p className="text-sm text-gray-300 line-clamp-4">{service.description}</p>
                  <div className="flex items-center gap-2 text-xs text-yellow-300">
                    <FaStar className="text-sm" />
                    {service.reviewsCount > 0 ? (
                      <span>
                        {service.averageRating.toFixed(1)} ({service.reviewsCount})
                      </span>
                    ) : (
                      <span className="text-gray-400">Sin reseñas</span>
                    )}
                  </div>
                </div>

                <footer className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-yellow-300">
                    ${Number(service.price).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleServiceStatus(service)}
                    disabled={updatingId === service.id}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {service.isActive ? "Desactivar" : "Activar"}
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4 text-white">
          <header>
            <p className="text-xs uppercase tracking-[0.3em] text-pink-300">Nuevo servicio</p>
            <h2 className="text-2xl font-semibold">Registra una nueva experiencia</h2>
            <p className="text-sm text-gray-300">
              Completa la informacion clave para que tus clientes puedan reservarla.
            </p>
          </header>
          <ServiceForm onCreated={handleServiceCreated} onClose={() => setModalOpen(false)} />
        </div>
      </Modal>
    </section>
  );
}

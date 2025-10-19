"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  deleteService,
  getAllServices,
  updateService,
  type ServiceResponse,
} from "@/service/serviceService";
import ServiceForm from "@/components/services/ServiceForm";
import Modal from "@/components/Modal";
import { useToast } from "@/providers/ToastProvider";
import { getErrorMessage } from "@/utils/error";
import { getAllUsers, type User } from "@/service/userService";
import {
  FaClock,
  FaMoneyBillWave,
  FaPlus,
  FaStar,
  FaTrash,
  FaUserTie,
} from "react-icons/fa";

export default function AdminServicios() {
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [providers, setProviders] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceResponse | null>(
    null,
  );
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceResponse | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [data, users] = await Promise.all([
        getAllServices(),
        getAllUsers(),
      ]);
      setServices(
        data.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
      );
      setProviders(
        users.filter((user) => user.role === "prestador_servicio"),
      );
    } catch (caughtError: unknown) {
      const message = getErrorMessage(
        caughtError,
        "No se pudieron cargar los servicios",
      );
      setError(message);
      showToast({ variant: "error", description: message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return services;
    }

    return services.filter((service) => {
      const providerName = service.provider?.fullName ?? "";
      return (
        service.name.toLowerCase().includes(query) ||
        providerName.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    });
  }, [search, services]);

  const toggleActiveState = async (service: ServiceResponse) => {
    setProcessingId(service.id);
    try {
      const updated = await updateService(service.id, {
        isActive: !service.isActive,
      });
      setServices((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      showToast({
        variant: "success",
        title: "Estado actualizado",
        description: `El servicio ${updated.isActive ? "se activó" : "se desactivó"} correctamente.`,
      });
    } catch (caughtError: unknown) {
      const message = getErrorMessage(
        caughtError,
        "No se pudo actualizar el servicio",
      );
      setError(message);
      showToast({ variant: "error", description: message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessingId(deleteTarget.id);
    try {
      await deleteService(deleteTarget.id);
      setServices((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      showToast({
        variant: "success",
        title: "Servicio eliminado",
        description: "Se eliminó el servicio y dejará de mostrarse públicamente.",
      });
      setDeleteTarget(null);
    } catch (caughtError: unknown) {
      const message = getErrorMessage(
        caughtError,
        "No se pudo eliminar el servicio",
      );
      setError(message);
      showToast({ variant: "error", description: message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleFormClose = () => {
    setModalOpen(false);
    setEditingService(null);
  };

  const providerOptions = useMemo(
    () =>
      providers.map((provider) => ({
        id: provider.id,
        label:
          provider.fullName?.trim() ||
          `${provider.firstName ?? ""} ${provider.lastName ?? ""}`.trim() ||
          provider.email,
      })),
    [providers],
  );

  const handleCreated = (service: ServiceResponse) => {
    setServices((prev) => [service, ...prev]);
    showToast({
      variant: "success",
      title: "Servicio publicado",
      description: "Los clientes ya pueden reservar la nueva experiencia.",
    });
  };

  const handleUpdated = (service: ServiceResponse) => {
    setServices((prev) =>
      prev.map((item) => (item.id === service.id ? service : item)),
    );
    showToast({
      variant: "success",
      title: "Cambios guardados",
      description: "Servicio actualizado correctamente.",
    });
  };

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Gestión de catálogo
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Diseña, activa y controla tus servicios
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              Mantén tu portafolio atractivo y actualizado en cuestión de segundos.
              Activa/desactiva servicios, edita información y conoce su rendimiento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingService(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
          >
            <FaPlus className="text-sm" />
            Registrar nuevo servicio
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, descripción o profesional..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
          />
          {error ? (
            <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-gray-300">
          No hay servicios registrados con ese filtro. Agrega uno nuevo o amplía la
          búsqueda.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl transition hover:border-pink-400/50"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Servicio #{service.id.slice(0, 6)}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-white">
                      {service.name}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      service.isActive
                        ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                        : "border border-orange-400/40 bg-orange-500/10 text-orange-200"
                    }`}
                  >
                    {service.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-4">
                  {service.description}
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                  <InfoChip
                    icon={<FaMoneyBillWave className="text-base text-yellow-300" />}
                    label="Precio"
                    value={Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(service.price)}
                  />
                  <InfoChip
                    icon={<FaClock className="text-base text-cyan-300" />}
                    label="Duración"
                    value={`${service.durationMinutes} min`}
                  />
                  <InfoChip
                    icon={<FaStar className="text-base text-amber-300" />}
                    label="Reseñas"
                    value={
                      service.reviewsCount > 0
                        ? `${service.averageRating.toFixed(1)} · ${
                            service.reviewsCount
                          }`
                        : "Sin reseñas"
                    }
                  />
                  <InfoChip
                    icon={<FaUserTie className="text-base text-emerald-300" />}
                    label="Profesional"
                    value={
                      service.provider?.fullName ?? service.provider?.email ?? "Sin asignar"
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => toggleActiveState(service)}
                  disabled={processingId === service.id}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 font-semibold text-white transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingId === service.id
                    ? "Actualizando..."
                    : service.isActive
                      ? "Desactivar"
                      : "Activar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingService(service);
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-pink-400/40 px-4 py-2 font-semibold text-pink-200 transition hover:border-pink-300 hover:text-pink-100"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(service)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/40 px-4 py-2 font-semibold text-red-200 transition hover:border-red-300 hover:text-red-100"
                >
                  <FaTrash className="text-xs" />
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={handleFormClose}>
        <div className="space-y-4 text-white">
          <header>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {editingService ? "Editar servicio" : "Nuevo servicio"}
            </p>
            <h3 className="text-2xl font-semibold">
              {editingService ? editingService.name : "Publica una nueva experiencia"}
            </h3>
            <p className="text-sm text-gray-300">
              Completa la información para que aparezca disponible en el portal de
              reservas.
            </p>
          </header>
          <ServiceForm
            service={editingService ?? undefined}
            providerOptions={providerOptions}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
            onClose={handleFormClose}
          />
        </div>
      </Modal>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <div className="space-y-4 text-white">
          <header>
            <h3 className="text-2xl font-semibold">¿Eliminar servicio?</h3>
            <p className="mt-1 text-sm text-gray-300">
              Esta acción no se puede revertir. El servicio desaparecerá del listado público
              y de las reservas activas.
            </p>
          </header>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200">
            {deleteTarget?.name}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              disabled={processingId === deleteTarget?.id}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-red-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={processingId === deleteTarget?.id}
            >
              <FaTrash className="text-xs" />
              {processingId === deleteTarget?.id ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950/40">
        {icon}
      </span>
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/50">
          {label}
        </p>
        <p className="text-xs font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

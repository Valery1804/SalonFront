"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  generateServiceSlots,
  getMyServiceSlots,
  updateServiceSlotStatus,
  type ServiceSlot,
  type ServiceSlotStatus,
} from "@/service/serviceSlotService";
import { getAllServices, type ServiceResponse } from "@/service/serviceService";
import {
  getStaffAppointments,
  type Appointment,
} from "@/service/appointmentService";
import { getErrorMessage } from "@/utils/error";

const STATUS_LABEL: Record<ServiceSlotStatus, string> = {
  available: "Disponible",
  reserved: "Reservado",
  blocked: "Bloqueado",
  completed: "Completado",
  cancelled: "Cancelado",
};

const EDITABLE_STATUSES: ServiceSlotStatus[] = ["available", "blocked", "cancelled"];

export default function ServiceSlotsDashboard() {
  const { user, initializing } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [slots, setSlots] = useState<ServiceSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    serviceId: "",
    date: today,
    startTime: "",
    endTime: "",
    durationMinutes: "",
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const upcomingAppointments = useMemo(() => {
    const nowTs = Date.now();
    return appointments
      .filter((appointment) => {
        const dateTs = new Date(`${appointment.date}T${appointment.startTime}`).getTime();
        return (
          (appointment.status === "pendiente" || appointment.status === "confirmada") &&
          dateTs >= nowTs
        );
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
        const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
        return dateA - dateB;
      })
      .slice(0, 6);
  }, [appointments]);

  const isProvider = user?.role === "prestador_servicio";

  useEffect(() => {
    if (!isProvider || !user) return;
    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const data = await getAllServices();
        const ownedServices = data.filter((service) => service.providerId === user.id);
        setServices(ownedServices);
        setForm((prev) => ({
          ...prev,
          serviceId: ownedServices[0]?.id ?? "",
        }));
      } catch (err) {
        setError(getErrorMessage(err, "No se pudieron cargar los servicios"));
      } finally {
        setLoadingServices(false);
      }
    };
    void loadServices();
  }, [isProvider, user]);

  const loadSlots = useMemo(
    () => async (date?: string) => {
      if (!isProvider) return;
      setLoadingSlots(true);
      setError(null);
      try {
        const data = await getMyServiceSlots(date);
        setSlots(data);
      } catch (err) {
        setError(getErrorMessage(err, "No se pudieron cargar tus slots"));
      } finally {
        setLoadingSlots(false);
      }
    },
    [isProvider],
  );

  useEffect(() => {
    if (!isProvider) return;
    void loadSlots();
  }, [isProvider, loadSlots]);

  useEffect(() => {
    if (!isProvider || !user) return;
    const loadAppointments = async () => {
      setLoadingAppointments(true);
      setAppointmentsError(null);
      try {
        const data = await getStaffAppointments(user.id);
        setAppointments(data);
      } catch (err) {
        setAppointmentsError(getErrorMessage(err, "No se pudieron cargar tus citas"));
      } finally {
        setLoadingAppointments(false);
      }
    };
    void loadAppointments();
  }, [isProvider, user]);

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setGenerating(true);
    setMessage(null);
    setError(null);

    try {
      await generateServiceSlots({
        providerId: user.id,
        serviceId: form.serviceId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        durationMinutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : undefined,
      });

      setMessage("Slots generados correctamente");
      setForm({
        serviceId: "",
        date: "",
        startTime: "",
        endTime: "",
        durationMinutes: "",
      });
      await loadSlots(selectedDate || undefined);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron generar los slots"));
    } finally {
      setGenerating(false);
    }
  };

  const handleFilter = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadSlots(selectedDate || undefined);
  };

  const handleStatusChange = async (
    slotId: string,
    status: ServiceSlotStatus,
  ) => {
    setMessage(null);
    setError(null);
    try {
      await updateServiceSlotStatus(slotId, { status });
      setMessage("Slot actualizado");
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                status,
                clientId: status === "available" ? null : slot.clientId,
              }
            : slot,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo actualizar el slot"));
    }
  };

  if (initializing) {
    return (
      <section className="max-w-5xl mx-auto p-6">
        <p>Cargando...</p>
      </section>
    );
  }

  if (!isProvider) {
    return (
      <section className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Acceso restringido</h1>
        <p className="text-gray-300">
          Esta seccion esta disponible unicamente para prestadores de servicio.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Gestion de Slots</h1>
        <p className="text-gray-300">
          Genera tu agenda diaria y administra la disponibilidad de cada slot.
        </p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-500/10 border border-green-500/40 text-green-300 px-4 py-3 rounded">
          {message}
        </div>
      )}

      <section className="bg-slate-800/60 border border-white/10 rounded-lg p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Generar nuevos slots</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGenerate}>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Servicio</span>
            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleFormChange}
              className="bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-pink-500/40"
              required
              disabled={loadingServices}
            >
              <option value="">Selecciona un servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.durationMinutes} min
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Fecha</span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              className="bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-pink-500/40"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Hora de inicio</span>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleFormChange}
              className="bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-pink-500/40"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">Hora de fin</span>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleFormChange}
              className="bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-pink-500/40"
              required
            />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm text-gray-300">
              Duracion por slot (opcional, en minutos)
            </span>
            <input
              type="number"
              name="durationMinutes"
              min={5}
              value={form.durationMinutes}
              onChange={handleFormChange}
              placeholder="Se usara la Duracion del servicio si lo dejas vacio"
              className="bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-pink-500/40"
            />
          </label>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={generating || loadingServices}
              className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-pink-500/30 transition disabled:opacity-60"
            >
              {generating ? "Generando..." : "Generar slots"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-slate-800/60 border border-white/10 rounded-lg p-6 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Mis slots</h2>
            <p className="text-sm text-gray-400">
              Consulta y actualiza la disponibilidad de cada espacio.
            </p>
          </div>
          <form className="flex gap-2 items-center" onSubmit={handleFilter}>
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <span>Fecha:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-pink-500/40"
              />
            </label>
            <button
              type="submit"
              className="bg-slate-900 border border-white/20 text-white px-4 py-2 rounded-full text-sm hover:border-pink-500/60 transition"
            >
              Filtrar
            </button>
            <button
              type="button"
              onClick={async () => {
                setSelectedDate("");
                await loadSlots();
              }}
              className="text-sm text-gray-300 hover:text-yellow-300 transition"
            >
              Limpiar
            </button>
          </form>
        </div>

        {loadingSlots ? (
          <p className="text-gray-300">Cargando slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-gray-400">Aun no tienes slots generados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr className="text-left text-sm text-gray-300">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Horario</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      {new Date(slot.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="px-4 py-3">
                      {slot.service?.name ?? "Servicio"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white">
                        {STATUS_LABEL[slot.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <select
                          value={slot.status}
                          onChange={(event) =>
                            void handleStatusChange(
                              slot.id,
                              event.target.value as ServiceSlotStatus,
                            )
                          }
                          className="bg-slate-900 border border-white/10 rounded px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-pink-500/40"
                        >
                          {EDITABLE_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-white/10 bg-slate-800/60 p-6 shadow-lg">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Proximas citas confirmadas</h2>
            <p className="text-sm text-gray-400">
              Visualiza las reservas pendientes para prepararte con tiempo.
            </p>
          </div>
        </div>

        {loadingAppointments ? (
          <p className="text-gray-300">Cargando citas...</p>
        ) : appointmentsError ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {appointmentsError}
          </p>
        ) : upcomingAppointments.length === 0 ? (
          <p className="text-gray-400">No tienes citas proximas.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-gray-200"
              >
                <header className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-semibold text-white">
                    {appointment.service?.name ?? "Servicio"}
                  </h3>
                  <span className="rounded-full border border-yellow-400/40 px-3 py-1 text-xs font-semibold text-yellow-200">
                    {appointment.startTime.slice(0, 5)} hs
                  </span>
                </header>
                <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">
                  {new Date(`${appointment.date}T${appointment.startTime}`).toLocaleString("es-ES", {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
                <p className="mt-2 text-xs text-gray-300">
                  Cliente: {appointment.client?.fullName ?? appointment.client?.email ?? "N/A"}
                </p>
                {appointment.notes && (
                  <p className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                    Nota: {appointment.notes}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAllAppointments,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from "@/service/appointmentService";
import { getErrorMessage } from "@/utils/error";
import { useToast } from "@/providers/ToastProvider";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

const STATUS_OPTIONS: Array<{ value: AppointmentStatus; comment: string }> = [
  { value: "pendiente", comment: "Por confirmar" },
  { value: "confirmada", comment: "En agenda" },
  { value: "completada", comment: "Finalizada" },
  { value: "cancelada", comment: "Cancelada" },
  { value: "no_asistio", comment: "No asistió" },
];

export default function AdminAgenda() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "todos">(
    "todos",
  );
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllAppointments();
        setAppointments(data);
      } catch (caughtError: unknown) {
        const message = getErrorMessage(
          caughtError,
          "No se pudieron cargar las citas",
        );
        setError(message);
        showToast({ variant: "error", description: message });
      } finally {
        setLoading(false);
      }
    };

    void loadAppointments();
  }, [showToast]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesStatus =
        statusFilter === "todos" || appointment.status === statusFilter;

      const matchesDate =
        !dateFilter ||
        new Date(`${appointment.date}T00:00:00`).toISOString().slice(0, 10) ===
          dateFilter;

      const searchValue = search.trim().toLowerCase();
      const matchesSearch =
        searchValue.length === 0 ||
        `${appointment.client?.fullName ?? ""} ${
          appointment.client?.email ?? ""
        } ${appointment.service?.name ?? ""} ${
          appointment.staff?.fullName ?? ""
        }`
          .toLowerCase()
          .includes(searchValue);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [appointments, dateFilter, search, statusFilter]);

  const changeStatus = async (appointment: Appointment, status: AppointmentStatus) => {
    if (appointment.status === status) {
      return;
    }

    setUpdatingId(appointment.id);
    try {
      const updated = await updateAppointmentStatus(appointment.id, status);
      setAppointments((prev) =>
        prev.map((item) => (item.id === appointment.id ? updated : item)),
      );
      showToast({
        variant: "success",
        title: "Estado actualizado",
        description: `La cita pasó a ${STATUS_LABELS[status]}.`,
      });
    } catch (caughtError: unknown) {
      const message = getErrorMessage(
        caughtError,
        "No se pudo actualizar la cita",
      );
      setError(message);
      showToast({ variant: "error", description: message });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Agenda operativa
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Control total de las citas programadas
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              Filtra por estado, busca por cliente o servicio y actualiza cada cita en
              segundos. Mantén sincronizado al equipo con la vista administrativa.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="w-full rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50 sm:w-auto"
            />
            <div className="flex items-center rounded-full border border-white/10 bg-slate-900/70 px-3 text-sm text-white">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as AppointmentStatus | "todos")
                }
                className="bg-transparent px-1 py-2 text-sm focus:outline-none"
              >
                <option value="todos">Todos los estados</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {STATUS_LABELS[option.value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, servicio o staff..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
          />
        </div>
        {error ? (
          <p className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl">
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_1.2fr_1fr] gap-4 border-b border-white/10 bg-slate-900/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/50 lg:grid">
          <span>Cliente</span>
          <span>Servicio</span>
          <span>Staff</span>
          <span>Fecha y hora</span>
          <span>Estado</span>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-300">
            No se encontraron citas con los filtros seleccionados.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredAppointments.map((appointment) => {
              const appointmentDate = new Date(
                `${appointment.date}T${appointment.startTime}`,
              );
              const formattedDate = appointmentDate.toLocaleDateString("es-ES", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              });

              return (
                <div
                  key={appointment.id}
                  className="grid gap-4 px-6 py-4 text-sm text-gray-200 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr_1fr]"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {appointment.client?.fullName ??
                        appointment.client?.email ??
                        "Cliente sin nombre"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {appointment.client?.email ?? "Sin correo registrado"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {appointment.service?.name ?? "Servicio"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {appointment.service
                        ? `${appointment.service.durationMinutes} min`
                        : "Sin duración"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {appointment.staff?.fullName ??
                        appointment.staff?.email ??
                        "Staff pendiente"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {appointment.staff?.providerType
                        ? appointment.staff.providerType.replace("_", " ")
                        : "Sin especialidad"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {appointment.startTime.slice(0, 5)} · {formattedDate}
                    </p>
                    <p className="text-xs text-gray-400">
                      Creada el{" "}
                      {new Date(appointment.createdAt).toLocaleDateString(
                        "es-ES",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 lg:items-end">
                    <span className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {STATUS_LABELS[appointment.status]}
                    </span>
                    <select
                      value={appointment.status}
                      onChange={(event) =>
                        void changeStatus(
                          appointment,
                          event.target.value as AppointmentStatus,
                        )
                      }
                      disabled={updatingId === appointment.id}
                      className="rounded-full border border-white/15 bg-slate-950/60 px-3 py-2 text-xs uppercase tracking-wide text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {STATUS_LABELS[option.value]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {appointment.notes ? (
                    <div className="lg:col-span-5">
                      <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-gray-300">
                        Nota del cliente: {appointment.notes}
                      </p>
                    </div>
                  ) : null}
                  {appointment.cancellationReason ? (
                    <div className="lg:col-span-5">
                      <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                        Motivo de cancelación: {appointment.cancellationReason}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  getAllAppointments,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from "@/service/appointmentService";
import { getErrorMessage } from "@/utils/error";
import { useToast } from "@/providers/ToastProvider";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaUserFriends,
} from "react-icons/fa";
import Badge from "@/components/ui/Badge";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import AnimatedSection from "@/components/ui/AnimatedSection";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

const STATUS_VARIANTS: Record<
  AppointmentStatus,
  "success" | "error" | "warning" | "info" | "neutral"
> = {
  pendiente: "warning",
  confirmada: "info",
  completada: "success",
  cancelada: "error",
  no_asistio: "error",
};

export default function PrestadorMisCitas() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState<"hoy" | "semana" | "mes" | "todas">("hoy");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllAppointments();
        // Filtrar solo las citas donde el usuario actual es el staff
        const myCitas = data.filter((apt) => apt.staffId === user?.id);
        setAppointments(myCitas);
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

    if (user?.id) {
      void loadAppointments();
    }
  }, [showToast, user?.id]);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const monthFromNow = new Date(today);
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);

      if (dateFilter === "hoy") {
        return aptDate.toDateString() === today.toDateString();
      } else if (dateFilter === "semana") {
        return aptDate >= today && aptDate <= weekFromNow;
      } else if (dateFilter === "mes") {
        return aptDate >= today && aptDate <= monthFromNow;
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [appointments, dateFilter]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();
    return appointments.filter(
      (apt) => new Date(apt.date).toDateString() === today &&
        (apt.status === "pendiente" || apt.status === "confirmada")
    );
  }, [appointments]);

  const pendingCount = useMemo(
    () => appointments.filter((apt) => apt.status === "pendiente").length,
    [appointments]
  );

  const confirmedCount = useMemo(
    () => appointments.filter((apt) => apt.status === "confirmada").length,
    [appointments]
  );

  const completedThisMonth = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return appointments.filter(
      (apt) =>
        apt.status === "completada" &&
        new Date(apt.date) >= firstDay
    ).length;
  }, [appointments]);

  const changeStatus = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    if (appointment.status === newStatus) return;

    setUpdatingId(appointment.id);
    try {
      const updated = await updateAppointmentStatus(appointment.id, newStatus);
      setAppointments((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showToast({
        variant: "success",
        title: "Estado actualizado",
        description: `La cita cambió a ${STATUS_LABELS[newStatus]}.`,
      });
    } catch (caughtError: unknown) {
      const message = getErrorMessage(
        caughtError,
        "No se pudo actualizar la cita"
      );
      setError(message);
      showToast({ variant: "error", description: message });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <AnimatedSection direction="down">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-pink-500/20 via-orange-500/10 to-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
          <h2 className="text-3xl font-semibold text-white">
            Mis Citas Programadas
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Gestiona tus citas, actualiza estados y mantén el control de tu agenda
            profesional.
          </p>
        </div>
      </AnimatedSection>

      {/* Métricas */}
      <AnimatedSection direction="up" delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/20">
                <FaCalendarAlt className="text-2xl text-yellow-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Hoy
                </p>
                <p className="text-2xl font-semibold text-white">
                  {todayAppointments.length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-400/20">
                <FaClock className="text-2xl text-orange-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Pendientes
                </p>
                <p className="text-2xl font-semibold text-white">
                  {pendingCount}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20">
                <FaUserFriends className="text-2xl text-cyan-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Confirmadas
                </p>
                <p className="text-2xl font-semibold text-white">
                  {confirmedCount}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20">
                <FaCheckCircle className="text-2xl text-emerald-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Completadas (mes)
                </p>
                <p className="text-2xl font-semibold text-white">
                  {completedThisMonth}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </AnimatedSection>

      {/* Filtros */}
      <AnimatedSection direction="up" delay={0.2}>
        <div className="flex flex-wrap gap-3">
          {(["hoy", "semana", "mes", "todas"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                dateFilter === filter
                  ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/30"
                  : "border border-white/10 text-gray-300 hover:border-pink-400/60"
              }`}
            >
              {filter === "hoy"
                ? "Hoy"
                : filter === "semana"
                  ? "Esta semana"
                  : filter === "mes"
                    ? "Este mes"
                    : "Todas"}
            </button>
          ))}
        </div>
      </AnimatedSection>

      {error && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Lista de citas */}
      <AnimatedSection direction="up" delay={0.3}>
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>
              Agenda ({filteredAppointments.length}{" "}
              {filteredAppointments.length === 1 ? "cita" : "citas"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-gray-300">
                No tienes citas programadas para este filtro.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-pink-400/40"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">
                              {appointment.service?.name ?? "Servicio"}
                            </h3>
                            <p className="mt-1 text-sm text-gray-300">
                              Cliente:{" "}
                              {appointment.client?.fullName ??
                                appointment.client?.email ??
                                "Sin datos"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                              <span className="rounded-full border border-white/15 px-3 py-1">
                                📅{" "}
                                {new Date(appointment.date).toLocaleDateString(
                                  "es-ES",
                                  {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                  }
                                )}
                              </span>
                              <span className="rounded-full border border-white/15 px-3 py-1">
                                ⏰ {appointment.startTime.slice(0, 5)}
                              </span>
                              <span className="rounded-full border border-white/15 px-3 py-1">
                                ⏱️ {appointment.service?.durationMinutes ?? "?"}{" "}
                                min
                              </span>
                            </div>
                          </div>
                          <Badge variant={STATUS_VARIANTS[appointment.status]}>
                            {STATUS_LABELS[appointment.status]}
                          </Badge>
                        </div>

                        {appointment.notes && (
                          <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                            💬 {appointment.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <select
                          value={appointment.status}
                          onChange={(e) =>
                            void changeStatus(
                              appointment,
                              e.target.value as AppointmentStatus
                            )
                          }
                          disabled={updatingId === appointment.id}
                          className="rounded-full border border-white/15 bg-slate-950/60 px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="completada">Completada</option>
                          <option value="cancelada">Cancelada</option>
                          <option value="no_asistio">No asistió</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>
    </section>
  );
}

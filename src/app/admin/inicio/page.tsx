"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FaCalendarAlt,
  FaChartLine,
  FaClipboardList,
  FaUserTie,
} from "react-icons/fa";
import {
  getAllAppointments,
  getAppointmentStatistics,
  type Appointment,
  type AppointmentStatistics,
} from "@/service/appointmentService";
import {
  getAllServices,
  type ServiceResponse,
} from "@/service/serviceService";
import { getAllUsers, type User } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import { useToast } from "@/providers/ToastProvider";

interface DashboardState {
  appointments: Appointment[];
  services: ServiceResponse[];
  users: User[];
  stats: AppointmentStatistics | null;
}

const INITIAL_STATE: DashboardState = {
  appointments: [],
  services: [],
  users: [],
  stats: null,
};

export default function AdminInicio() {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const [appointments, services, users, stats] = await Promise.all([
          getAllAppointments(),
          getAllServices(),
          getAllUsers(),
          getAppointmentStatistics(startDate, endDate),
        ]);

        setData({
          appointments,
          services,
          users,
          stats,
        });
      } catch (caughtError: unknown) {
        const message = getErrorMessage(
          caughtError,
          "No pudimos cargar la información del panel",
        );
        setError(message);
        showToast({
          variant: "error",
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [endDate, showToast, startDate]);

  const providerCount = useMemo(
    () => data.users.filter((user) => user.role === "prestador_servicio").length,
    [data.users],
  );

  const clientCount = useMemo(
    () => data.users.filter((user) => user.role === "cliente").length,
    [data.users],
  );

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return data.appointments
      .filter((appointment) => {
        const appointmentDate = new Date(
          `${appointment.date}T${appointment.startTime}`,
        );
        return (
          appointmentDate.getTime() >= now.getTime() &&
          appointment.status !== "cancelada" &&
          appointment.status !== "no_asistio"
        );
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
        const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
        return dateA - dateB;
      })
      .slice(0, 6);
  }, [data.appointments]);

  const topServices = useMemo(() => {
    const counter = new Map<string, { service: ServiceResponse; total: number }>();

    for (const appointment of data.appointments) {
      if (
        appointment.status === "cancelada" ||
        appointment.status === "no_asistio" ||
        !appointment.service
      ) {
        continue;
      }

      const current = counter.get(appointment.serviceId);
      if (current) {
        current.total += 1;
      } else {
        counter.set(appointment.serviceId, {
          service: appointment.service,
          total: 1,
        });
      }
    }

    return Array.from(counter.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [data.appointments]);

  const expectedRevenue = useMemo(() => {
    return data.appointments
      .filter(
        (appointment) =>
          appointment.status === "confirmada" ||
          appointment.status === "completada",
      )
      .reduce((acc, appointment) => {
        return acc + (appointment.service?.price ?? 0);
      }, 0);
  }, [data.appointments]);

  return (
    <section className="space-y-10">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-pink-500/20 via-orange-500/10 to-slate-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Resumen del mes
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Salud del salón a primera vista
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              Visualiza el rendimiento actual, las citas próximas y los servicios más
              solicitados. Mantén el pulso de tu salón con información actualizada.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/admin/agenda"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2 font-semibold text-white transition hover:border-white/35"
            >
              <FaCalendarAlt className="text-sm" />
              Ver agenda
            </Link>
            <Link
              href="/admin/reportes"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-5 py-2 font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
            >
              <FaChartLine className="text-sm" />
              Reportes
            </Link>
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-3xl border border-red-400/40 bg-red-500/10 px-6 py-5 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FaClipboardList className="text-2xl text-yellow-300" />}
          title="Citas del mes"
          value={
            loading
              ? "..."
              : data.stats
                ? Intl.NumberFormat("es-CO").format(data.stats.total)
                : "0"
          }
          subtitle={
            loading || !data.stats
              ? "Recuento mensual"
              : `${data.stats.confirmadas} confirmadas / ${data.stats.completadas} completadas`
          }
        />
        <StatCard
          icon={<FaCalendarAlt className="text-2xl text-cyan-300" />}
          title="Próximas 48 horas"
          value={
            loading
              ? "..."
              : upcomingAppointments.length.toString().padStart(2, "0")
          }
          subtitle="Citas ya agendadas"
        />
        <StatCard
          icon={<FaUserTie className="text-2xl text-emerald-300" />}
          title="Equipo activo"
          value={
            loading ? "..." : providerCount.toString().padStart(2, "0")
          }
          subtitle={`${clientCount} clientes registrados`}
        />
        <StatCard
          icon={<FaChartLine className="text-2xl text-pink-300" />}
          title="Ingresos estimados"
          value={
            loading
              ? "..."
              : Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(expectedRevenue)
          }
          subtitle="Citas confirmadas y completadas"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Próximas citas
              </h3>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Actualizado en tiempo real
              </p>
            </div>
            <Link
              href="/admin/agenda"
              className="text-xs font-semibold text-pink-300 transition hover:text-pink-200"
            >
              Ver agenda completa
            </Link>
          </header>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-gray-300">
                No hay citas próximas. Genera visibilidad activando más slots de
                servicio.
              </div>
            ) : (
              upcomingAppointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-200 transition hover:border-pink-400/40"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {appointment.service?.name ?? "Servicio"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Cliente:{" "}
                        {appointment.client?.fullName ??
                          appointment.client?.email ??
                          "Sin datos"}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-yellow-400/40 px-3 py-1 text-xs font-semibold text-yellow-200">
                      {appointment.startTime.slice(0, 5)} hs ·{" "}
                      {new Date(
                        `${appointment.date}T${appointment.startTime}`,
                      ).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                  {appointment.notes ? (
                    <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                      Nota: {appointment.notes}
                    </p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Servicios más reservados
              </h3>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Basado en citas confirmadas/completadas
              </p>
            </div>
            <Link
              href="/admin/servicios"
              className="text-xs font-semibold text-pink-300 transition hover:text-pink-200"
            >
              Gestionar
            </Link>
          </header>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            ) : topServices.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-gray-300">
                Aún no registras rendimiento suficiente. Promociona tus servicios
                destacados para generar más datos.
              </div>
            ) : (
              topServices.map(({ service, total }, index) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-200 transition hover:border-pink-400/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {index + 1}. {service.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {service.durationMinutes} min ·{" "}
                      {Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      }).format(service.price)}
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {total} reservas
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl transition hover:border-pink-400/50">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          {title}
        </p>
        <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      </div>
      <p className="text-xs text-white/70">{subtitle}</p>
    </article>
  );
}

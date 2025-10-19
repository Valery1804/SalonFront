"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAppointmentStatistics,
  getAppointmentsByDateRange,
  type Appointment,
  type AppointmentStatistics,
} from "@/service/appointmentService";
import { getErrorMessage } from "@/utils/error";
import { useToast } from "@/providers/ToastProvider";
import {
  FaCalendarAlt,
  FaChartPie,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

interface ReportState {
  stats: AppointmentStatistics | null;
  appointments: Appointment[];
}

const INITIAL_STATE: ReportState = {
  stats: null,
  appointments: [],
};

export default function AdminReportes() {
  const { showToast } = useToast();
  const [state, setState] = useState<ReportState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    return { start, end };
  });

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [stats, appointments] = await Promise.all([
        getAppointmentStatistics(range.start, range.end),
        getAppointmentsByDateRange(range.start, range.end),
      ]);
      setState({ stats, appointments });
    } catch (caughtError: unknown) {
      const message = getErrorMessage(
        caughtError,
        "No se pudieron cargar los reportes",
      );
      setError(message);
      showToast({ variant: "error", description: message });
    } finally {
      setLoading(false);
    }
  }, [range.end, range.start, showToast]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const performance = useMemo(() => {
    if (!state.stats) {
      return [];
    }
    return [
      {
        label: "Confirmadas",
        value: state.stats.confirmadas,
        color: "from-emerald-500 to-emerald-400",
      },
      {
        label: "Completadas",
        value: state.stats.completadas,
        color: "from-sky-500 to-sky-400",
      },
      {
        label: "Canceladas",
        value: state.stats.canceladas,
        color: "from-red-500 to-red-400",
      },
      {
        label: "No asistió",
        value: state.stats.noAsistio,
        color: "from-orange-500 to-orange-400",
      },
    ];
  }, [state.stats]);

  const serviceDistribution = useMemo(() => {
    const map = new Map<string, { name: string; total: number }>();
    for (const appointment of state.appointments) {
      if (!appointment.service) continue;
      const key = appointment.serviceId;
      if (!map.has(key)) {
        map.set(key, {
          name: appointment.service.name,
          total: 0,
        });
      }
      map.get(key)!.total += 1;
    }
    const results = Array.from(map.values()).sort((a, b) => b.total - a.total);
    const total = results.reduce((acc, item) => acc + item.total, 0);
    return results.map((item) => ({
      ...item,
      percentage: total === 0 ? 0 : Math.round((item.total / total) * 100),
    }));
  }, [state.appointments]);

  const conversionRate = useMemo(() => {
    if (!state.stats || state.stats.total === 0) return 0;
    const attended =
      state.stats.completadas + state.stats.confirmadas - state.stats.canceladas;
    return Math.max(
      0,
      Math.round((attended / state.stats.total) * 100),
    );
  }, [state.stats]);

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Reportes estratégicos
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Analiza el pulso de tu salón en segundos
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              Visualiza el desempeño de tus citas, identifica servicios líderes y
              detecta oportunidades de mejora con indicadores claros.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadReports()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            <FaCalendarAlt className="text-sm" />
            Actualizar datos
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white">
            <label className="mr-3 text-xs uppercase tracking-[0.3em] text-white/50">
              Desde
            </label>
            <input
              type="date"
              value={range.start}
              onChange={(event) =>
                setRange((prev) => ({ ...prev, start: event.target.value }))
              }
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white">
            <label className="mr-3 text-xs uppercase tracking-[0.3em] text-white/50">
              Hasta
            </label>
            <input
              type="date"
              value={range.end}
              onChange={(event) =>
                setRange((prev) => ({ ...prev, end: event.target.value }))
              }
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>
        {error ? (
          <p className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          label="Total de citas"
          value={loading ? "..." : state.stats?.total.toString() ?? "0"}
          detail="Rango seleccionado"
        />
        <ReportCard
          label="Tasa de conversión"
          value={loading ? "..." : `${conversionRate}%`}
          detail="Citas que se mantienen vigentes"
        />
        <ReportCard
          label="Completadas"
          value={
            loading ? "..." : state.stats?.completadas.toString().padStart(2, "0") ?? "0"
          }
          detail="Clientes atendidos a tiempo"
        />
        <ReportCard
          label="Cancelaciones"
          value={
            loading ? "..." : state.stats?.canceladas.toString().padStart(2, "0") ?? "0"
          }
          detail="Citas canceladas o no asistidas"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Rendimiento por estado
              </h3>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Distribución de citas
              </p>
            </div>
          </header>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : performance.every((item) => item.value === 0) ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-gray-300">
                No hay datos suficientes en el rango seleccionado.
              </div>
            ) : (
              performance.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      style={{
                        width: `${Math.min(100, item.value * 10)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Servicios con más demanda
              </h3>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Ranking de reservas
              </p>
            </div>
            <FaChartPie className="text-xl text-pink-300" />
          </header>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : serviceDistribution.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-gray-300">
                No hay reservas registradas en este periodo para mostrar tendencias.
              </div>
            ) : (
              serviceDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-200 transition hover:border-pink-400/40"
                >
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {item.total} reservas · {item.percentage}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-xs font-semibold text-white">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Detalle de cancelaciones y no asistencias
            </h3>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Casos a revisar con el equipo
            </p>
          </div>
          <FaTimes className="text-xl text-red-300" />
        </header>

        {loading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {state.appointments
              .filter(
                (appointment) =>
                  appointment.status === "cancelada" ||
                  appointment.status === "no_asistio",
              )
              .map((appointment) => (
                <article
                  key={appointment.id}
                  className="space-y-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">
                      {appointment.service?.name ?? "Servicio"}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {appointment.status === "cancelada" ? (
                        <>
                          <FaTimes className="text-xs" />
                          Cancelada
                        </>
                      ) : (
                        <>
                          <FaCheck className="text-xs" />
                          No asistió
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-red-200/80">
                    Cliente:{" "}
                    {appointment.client?.fullName ??
                      appointment.client?.email ??
                      "Sin datos"}
                  </p>
                  <p className="text-xs text-red-200/80">
                    Fecha:{" "}
                    {new Date(`${appointment.date}T${appointment.startTime}`).toLocaleString(
                      "es-ES",
                      {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                  {appointment.cancellationReason ? (
                    <p className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white">
                      Motivo: {appointment.cancellationReason}
                    </p>
                  ) : null}
                </article>
              ))}
          </div>
        )}
      </section>
    </section>
  );
}

function ReportCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl transition hover:border-pink-400/50">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
        {label}
      </p>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="text-xs text-white/70">{detail}</p>
    </article>
  );
}

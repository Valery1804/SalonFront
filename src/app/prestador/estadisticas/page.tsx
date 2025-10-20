"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { getAllAppointments, type Appointment } from "@/service/appointmentService";
import { getErrorMessage } from "@/utils/error";
import { FaChartLine, FaStar, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import AnimatedSection from "@/components/ui/AnimatedSection";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function PrestadorEstadisticas() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllAppointments();
        const myCitas = data.filter((apt) => apt.staffId === user?.id);
        setAppointments(myCitas);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudieron cargar las estadísticas"));
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      void loadData();
    }
  }, [user?.id]);

  const stats = useMemo(() => {
    const filtered = appointments.filter((apt) => {
      const date = new Date(apt.date);
      return date >= new Date(range.start) && date <= new Date(range.end);
    });

    const completed = filtered.filter((a) => a.status === "completada").length;
    const cancelled = filtered.filter((a) => a.status === "cancelada").length;
    const noShow = filtered.filter((a) => a.status === "no_asistio").length;
    const total = filtered.length;

    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const serviceMap = new Map<string, { name: string; count: number }>();
    filtered.forEach((apt) => {
      if (apt.service) {
        const existing = serviceMap.get(apt.serviceId);
        if (existing) {
          existing.count++;
        } else {
          serviceMap.set(apt.serviceId, { name: apt.service.name, count: 1 });
        }
      }
    });

    const topServices = Array.from(serviceMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      completed,
      cancelled,
      noShow,
      successRate,
      topServices,
    };
  }, [appointments, range]);

  return (
    <section className="space-y-8">
      <AnimatedSection direction="down">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
          <h2 className="text-3xl font-semibold text-white">
            Mis Estadísticas
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Analiza tu desempeño y visualiza tus métricas profesionales
          </p>
        </div>
      </AnimatedSection>

      {/* Rango de fechas */}
      <AnimatedSection direction="up" delay={0.1}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
            <label className="mr-3 text-xs uppercase tracking-wider text-white/50">
              Desde
            </label>
            <input
              type="date"
              value={range.start}
              onChange={(e) => setRange((prev) => ({ ...prev, start: e.target.value }))}
              className="flex-1 bg-transparent text-sm text-white focus:outline-none"
            />
          </div>
          <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
            <label className="mr-3 text-xs uppercase tracking-wider text-white/50">
              Hasta
            </label>
            <input
              type="date"
              value={range.end}
              onChange={(e) => setRange((prev) => ({ ...prev, end: e.target.value }))}
              className="flex-1 bg-transparent text-sm text-white focus:outline-none"
            />
          </div>
        </div>
      </AnimatedSection>

      {error && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : (
        <>
          {/* Métricas principales */}
          <AnimatedSection direction="up" delay={0.2}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card variant="elevated">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20">
                    <FaCalendarAlt className="text-2xl text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      Total Citas
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20">
                    <FaCheckCircle className="text-2xl text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      Completadas
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {stats.completed}
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/20">
                    <FaStar className="text-2xl text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      Tasa de Éxito
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {stats.successRate}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/20">
                    <FaChartLine className="text-2xl text-red-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      Canceladas
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {stats.cancelled + stats.noShow}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </AnimatedSection>

          {/* Top servicios */}
          <AnimatedSection direction="up" delay={0.3}>
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <CardTitle>Servicios Más Solicitados</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topServices.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">
                    No hay datos suficientes para mostrar
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.topServices.map((service, index) => (
                      <div
                        key={service.name}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-sm font-semibold text-white">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-white">
                            {service.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-pink-300">
                            {service.count}
                          </p>
                          <p className="text-xs text-gray-400">reservas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </>
      )}
    </section>
  );
}

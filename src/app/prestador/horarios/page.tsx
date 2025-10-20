"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  generateServiceSlots,
  getMyServiceSlots,
  updateServiceSlotStatus,
  deleteServiceSlot,
  type ServiceSlot,
  type ServiceSlotStatus,
} from "@/service/serviceSlotService";
import { getAllServices, type ServiceResponse } from "@/service/serviceService";
import { getErrorMessage } from "@/utils/error";
import { useToast } from "@/providers/ToastProvider";
import {
  FaClock,
  FaPlus,
  FaTrash,
  FaCalendarDay,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Modal from "@/components/Modal";

const STATUS_LABELS: Record<ServiceSlotStatus, string> = {
  available: "Disponible",
  reserved: "Reservado",
  blocked: "Bloqueado",
  completed: "Completado",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<
  ServiceSlotStatus,
  "success" | "error" | "warning" | "info" | "neutral"
> = {
  available: "success",
  reserved: "info",
  blocked: "error",
  completed: "neutral",
  cancelled: "error",
};

const EDITABLE_STATUSES: ServiceSlotStatus[] = ["available", "blocked", "cancelled"];

export default function PrestadorHorarios() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [slots, setSlots] = useState<ServiceSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState<"dia" | "semana" | "mes">("dia");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    serviceId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "18:00",
    durationMinutes: "",
  });

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getAllServices();
        const myServices = data.filter((s) => s.providerId === user?.id);
        setServices(myServices);
        if (myServices.length > 0) {
          setForm((prev) => ({ ...prev, serviceId: myServices[0].id }));
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No se pudieron cargar los servicios"));
      }
    };

    if (user?.id) {
      void loadServices();
    }
  }, [user?.id]);

  const loadSlots = async (date?: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyServiceSlots(date);
      setSlots(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar los horarios"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      void loadSlots(selectedDate);
    }
  }, [user?.id, selectedDate]);

  const filteredSlots = useMemo(() => {
    return slots
      .filter((slot) => slot.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [slots, selectedDate]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todaySlots = slots.filter((s) => s.date === today);

    return {
      disponibles: todaySlots.filter((s) => s.status === "available").length,
      reservados: todaySlots.filter((s) => s.status === "reserved").length,
      bloqueados: todaySlots.filter((s) => s.status === "blocked").length,
      total: todaySlots.length,
    };
  }, [slots]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setGenerating(true);
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

      showToast({
        variant: "success",
        title: "Horarios generados",
        description: "Los slots se crearon correctamente",
      });
      setShowGenerateModal(false);
      await loadSlots(selectedDate);
    } catch (err: unknown) {
      showToast({
        variant: "error",
        description: getErrorMessage(err, "Error al generar horarios"),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (
    slotId: string,
    newStatus: ServiceSlotStatus
  ) => {
    try {
      await updateServiceSlotStatus(slotId, { status: newStatus });
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, status: newStatus } : slot
        )
      );
      showToast({
        variant: "success",
        description: `Estado actualizado a ${STATUS_LABELS[newStatus]}`,
      });
    } catch (err: unknown) {
      showToast({
        variant: "error",
        description: getErrorMessage(err, "Error al actualizar"),
      });
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm("¿Seguro que deseas eliminar este horario?")) return;

    setDeletingId(slotId);
    try {
      await deleteServiceSlot(slotId);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      showToast({
        variant: "success",
        description: "Horario eliminado correctamente",
      });
    } catch (err: unknown) {
      showToast({
        variant: "error",
        description: getErrorMessage(err, "Error al eliminar"),
      });
    } finally {
      setDeletingId(null);
    }
  };

  const changeDate = (days: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <AnimatedSection direction="down">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                Gestión de Horarios
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Administra tu disponibilidad y crea slots para tus servicios
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={<FaPlus />}
              onClick={() => setShowGenerateModal(true)}
            >
              Generar Horarios
            </Button>
          </div>
        </div>
      </AnimatedSection>

      {/* Estadísticas */}
      <AnimatedSection direction="up" delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="elevated">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20">
                <FaCheckCircle className="text-2xl text-emerald-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Disponibles Hoy
                </p>
                <p className="text-2xl font-semibold text-white">
                  {stats.disponibles}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20">
                <FaClock className="text-2xl text-cyan-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Reservados
                </p>
                <p className="text-2xl font-semibold text-white">
                  {stats.reservados}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/20">
                <FaBan className="text-2xl text-red-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Bloqueados
                </p>
                <p className="text-2xl font-semibold text-white">
                  {stats.bloqueados}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/20">
                <FaCalendarDay className="text-2xl text-yellow-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Total Hoy
                </p>
                <p className="text-2xl font-semibold text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </AnimatedSection>

      {/* Navegación de fecha */}
      <AnimatedSection direction="up" delay={0.2}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>
              ← Anterior
            </Button>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => changeDate(1)}>
              Siguiente →
            </Button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setSelectedDate(new Date().toISOString().split("T")[0])
            }
          >
            Ir a Hoy
          </Button>
        </div>
      </AnimatedSection>

      {error && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Lista de slots */}
      <AnimatedSection direction="up" delay={0.3}>
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>
              Horarios del{" "}
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </CardTitle>
            <CardDescription>
              {filteredSlots.length}{" "}
              {filteredSlots.length === 1 ? "slot" : "slots"} programados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-12 text-center">
                <FaClock className="mx-auto mb-3 text-4xl text-gray-500" />
                <p className="text-sm text-gray-300">
                  No hay horarios programados para esta fecha
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowGenerateModal(true)}
                >
                  Generar Horarios
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-pink-400/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                        <span className="text-xl font-semibold text-white">
                          {slot.startTime.slice(0, 5)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">
                          {slot.endTime.slice(0, 5)}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {slot.service?.name ?? "Servicio"}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {slot.service?.durationMinutes ?? 0} minutos
                        </p>
                      </div>

                      <Badge variant={STATUS_VARIANTS[slot.status]} size="md">
                        {STATUS_LABELS[slot.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={slot.status}
                        onChange={(e) =>
                          void handleStatusChange(
                            slot.id,
                            e.target.value as ServiceSlotStatus
                          )
                        }
                        disabled={!EDITABLE_STATUSES.includes(slot.status)}
                        className="rounded-full border border-white/15 bg-slate-950/60 px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {EDITABLE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>

                      {slot.status !== "reserved" && (
                        <button
                          onClick={() => void handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                          className="rounded-full border border-red-400/40 p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-40"
                          title="Eliminar slot"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Modal de generación */}
      <Modal
        open={showGenerateModal}
        onClose={() => !generating && setShowGenerateModal(false)}
      >
        <form onSubmit={handleGenerate} className="space-y-6 text-white">
          <div>
            <h3 className="text-2xl font-semibold">Generar Horarios</h3>
            <p className="mt-2 text-sm text-gray-300">
              Crea slots automáticamente para el día seleccionado
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Servicio *
              </label>
              <select
                value={form.serviceId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, serviceId: e.target.value }))
                }
                required
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
              >
                <option value="">Selecciona un servicio</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Fecha"
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Hora de inicio"
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startTime: e.target.value }))
                }
                required
              />
              <Input
                label="Hora de fin"
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endTime: e.target.value }))
                }
                required
              />
            </div>

            <Input
              label="Duración por slot (opcional)"
              type="number"
              min={5}
              placeholder="Se usará la duración del servicio"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  durationMinutes: e.target.value,
                }))
              }
              helpText="Minutos por cada slot. Déjalo vacío para usar la duración del servicio."
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowGenerateModal(false)}
              disabled={generating}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={generating}>
              {generating ? "Generando..." : "Generar Slots"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

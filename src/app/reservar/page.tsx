"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import {
  getActiveServices,
  type ServiceResponse,
} from "@/service/serviceService";
import {
  getAvailableSlotsByService,
  type ServiceSlot,
} from "@/service/serviceSlotService";
import { createAppointment } from "@/service/appointmentService";
import { getErrorMessage } from "@/utils/error";

function formatDateLabel(raw: string): string {
  if (!raw) return "";
  const normalized = raw.length > 10 ? raw : `${raw}T00:00:00`;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimeRange(slot: ServiceSlot): string {
  return `${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)}`;
}

const SLOT_PAGE_SIZE = 10;

export default function ReservarPage() {
  const { user, initializing } = useAuth();
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<ServiceSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [slotPageIndex, setSlotPageIndex] = useState(0);

  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId),
    [services, selectedServiceId],
  );

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId),
    [slots, selectedSlotId],
  );

  const slotsPageCount = Math.max(1, Math.ceil(slots.length / SLOT_PAGE_SIZE));
  const paginatedSlots = useMemo(
    () =>
      slots.slice(
        slotPageIndex * SLOT_PAGE_SIZE,
        slotPageIndex * SLOT_PAGE_SIZE + SLOT_PAGE_SIZE,
      ),
    [slots, slotPageIndex],
  );

  const loadSlots = useCallback(
    async (serviceId: string, date: string, options?: { preserveSelection?: boolean }) => {
      setSlotsLoading(true);
      setSlotsError("");
      if (!options?.preserveSelection) {
        setSelectedSlotId("");
        setSlotPageIndex(0);
      }
      try {
        const data = await getAvailableSlotsByService(serviceId, date);
        setSlots(data);
      } catch (error: unknown) {
        setSlots([]);
        setSlotsError(getErrorMessage(error, "No se pudo cargar la disponibilidad"));
      } finally {
        setSlotsLoading(false);
      }
    },
    [],
  );

  const refreshAvailability = useCallback(
    async (serviceId: string) => {
      setAvailabilityLoading(true);
      setSlots([]);
      setSlotsError("");
      setSelectedSlotId("");
      try {
        const all = await getAvailableSlotsByService(serviceId);
        const uniqueDates = Array.from(new Set(all.map((slot) => slot.date))).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime(),
        );
        setAvailableDates(uniqueDates);

        const nextDate =
          selectedDate && uniqueDates.includes(selectedDate)
            ? selectedDate
            : uniqueDates[0] ?? "";

        if (nextDate) {
          setSelectedDate(nextDate);
          await loadSlots(serviceId, nextDate, { preserveSelection: false });
        } else {
          setSelectedDate("");
          setSlots([]);
        }
      } catch (error: unknown) {
        setAvailableDates([]);
        setSelectedDate("");
        setSlots([]);
        setSlotsError(getErrorMessage(error, "No se pudo cargar la disponibilidad"));
      } finally {
        setAvailabilityLoading(false);
      }
    },
    [loadSlots, selectedDate],
  );

  const handleDateSelect = useCallback(
    async (date: string) => {
      setSelectedDate(date);
      if (!selectedServiceId) return;
      await loadSlots(selectedServiceId, date, { preserveSelection: false });
    },
    [selectedServiceId, loadSlots],
  );

  useEffect(() => {
    const maxIndex = Math.max(0, slotsPageCount - 1);
    if (slotPageIndex > maxIndex) {
      setSlotPageIndex(maxIndex);
    }
  }, [slotsPageCount, slotPageIndex]);

  useEffect(() => {
    if (!selectedSlotId) return;
    const currentIndex = slots.findIndex((slot) => slot.id === selectedSlotId);
    if (currentIndex === -1) {
      setSelectedSlotId("");
      return;
    }
    const desiredPage = Math.floor(currentIndex / SLOT_PAGE_SIZE);
    if (desiredPage !== slotPageIndex) {
      setSlotPageIndex(desiredPage);
    }
  }, [selectedSlotId, slots, slotPageIndex]);

  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError("");
      try {
        const data = await getActiveServices();
        setServices(data);
        if (data.length > 0) {
          setSelectedServiceId(data[0].id);
          setSelectedDate("");
        }
      } catch (error: unknown) {
        setServicesError(getErrorMessage(error, "No se pudieron cargar los servicios"));
      } finally {
        setServicesLoading(false);
      }
    };

    void loadServices();
  }, []);

  useEffect(() => {
    if (!selectedServiceId) {
      setAvailableDates([]);
      setSelectedDate("");
      setSlots([]);
      return;
    }
    void refreshAvailability(selectedServiceId);
  }, [selectedServiceId, refreshAvailability]);

  const handleBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }
    if (!selectedService || !selectedSlot) {
      setFeedback({ type: "error", message: "Selecciona un servicio y un horario disponible." });
      return;
    }
    const staffId =
      selectedService.providerId ??
      selectedSlot.service?.provider?.id ??
      selectedSlot.service?.providerId ??
      "";
    if (!staffId) {
      setFeedback({
        type: "error",
        message: "No se encontro el personal asignado para este servicio.",
      });
      return;
    }

    setBooking(true);
    setFeedback(null);

    try {
      const normalizedStart = selectedSlot.startTime.length > 5
        ? selectedSlot.startTime.slice(0, 5)
        : selectedSlot.startTime;

      await createAppointment({
        staffId,
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: normalizedStart,
        notes: notes.trim() ? notes.trim() : undefined,
        clientId: user.id,
      });

      setFeedback({
        type: "success",
        message: "Tu cita se registro con exito. Recibiras la confirmacion en tu correo.",
      });
      setNotes("");
      await loadSlots(selectedService.id, selectedDate, { preserveSelection: false });
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "No pudimos reservar tu cita. Intentalo de nuevo."),
      });
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 pt-28 pb-16 text-white">
      <section className="mx-auto max-w-6xl px-4">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-pink-300">Agenda en linea</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Reserva tu cita con SalonClick
          </h1>
          <p className="text-sm text-gray-300 sm:text-base">
            Elige el servicio, selecciona el horario que mejor se adapte a ti y confirma en segundos.
          </p>
        </header>

        {initializing ? (
          <div className="mt-16 flex justify-center">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-4 text-sm text-gray-300 shadow-lg">
              Cargando informacion...
            </div>
          </div>
        ) : !user ? (
          <div className="mt-16 rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-semibold text-white">Inicia sesion para reservar</h2>
            <p className="mt-3 text-sm text-gray-300">
              Necesitas una cuenta para vincular la cita con tu perfil, revisar tu historial y
              recibir notificaciones.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-pink-500/40"
              >
                Iniciar sesion
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleBooking}
            className="mt-12 grid gap-10 lg:grid-cols-[1.7fr_1fr]"
          >
            <div className="space-y-8">
              <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
                <header className="mb-6">
                  <h2 className="text-lg font-semibold text-white">1. Selecciona un servicio</h2>
                  <p className="text-sm text-gray-400">
                    Visualiza las opciones que ofrece nuestro equipo y escoge la que necesitas.
                  </p>
                </header>

                {servicesLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-28 animate-pulse rounded-2xl bg-white/5"
                      />
                    ))}
                  </div>
                ) : servicesError ? (
                  <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {servicesError}
                  </p>
                ) : services.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
                    Aun no hay servicios disponibles. Vuelve pronto.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {services.map((service) => {
                      const active = service.id === selectedServiceId;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedServiceId(service.id)}
                          className={`rounded-2xl border px-5 py-4 text-left transition hover:border-pink-400/60 hover:bg-white/5 ${
                            active
                              ? "border-pink-400/70 bg-gradient-to-br from-pink-500/10 to-orange-400/10 text-white shadow-lg shadow-pink-500/30"
                              : "border-white/10 text-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-base font-semibold">{service.name}</h3>
                            <span className="text-sm font-medium text-yellow-300">
                              ${Number(service.price).toFixed(2)}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-3 text-xs text-gray-300">
                            {service.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-wider text-gray-400">
                            <span>{service.durationMinutes} min</span>
                            {service.provider?.fullName && (
                              <span className="rounded-full border border-white/20 px-2 py-1">
                                {service.provider.fullName}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
                <header className="mb-6">
                  <h2 className="text-lg font-semibold text-white">2. Selecciona fecha y horario</h2>
                  <p className="text-sm text-gray-400">
                    Elige un dia disponible y luego selecciona el horario que prefieras.
                  </p>
                </header>

                <AvailabilityCalendar
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  loading={availabilityLoading}
                  onSelect={(date) => {
                    setSelectedSlotId("");
                    setSlotsError("");
                    void handleDateSelect(date);
                  }}
                />

                <div className="mt-6">
                  {!selectedDate ? (
                    <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-gray-300">
                      Selecciona una fecha disponible para ver los horarios.
                    </p>
                  ) : slotsLoading ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-20 animate-pulse rounded-2xl bg-white/5"
                        />
                      ))}
                    </div>
                  ) : slotsError ? (
                    <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {slotsError}
                    </p>
                  ) : slots.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-gray-300">
                      No hay horarios disponibles para esta fecha. Intenta con otro dia.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {slots.length > SLOT_PAGE_SIZE && (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                          <span>
                            Mostrando{" "}
                            {slotPageIndex * SLOT_PAGE_SIZE + 1}-
                            {Math.min(slots.length, (slotPageIndex + 1) * SLOT_PAGE_SIZE)} de{" "}
                            {slots.length} horarios
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSlotPageIndex((value) => Math.max(0, value - 1))}
                              disabled={slotPageIndex === 0}
                              className="rounded-full border border-white/15 px-3 py-1 font-semibold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Anterior
                            </button>
                            <span className="text-white/70">
                              {slotPageIndex + 1} / {slotsPageCount}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSlotPageIndex((value) =>
                                  Math.min(slotsPageCount - 1, value + 1),
                                )
                              }
                              disabled={slotPageIndex >= slotsPageCount - 1}
                              className="rounded-full border border-white/15 px-3 py-1 font-semibold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Siguiente
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {paginatedSlots.map((slot) => {
                          const active = slot.id === selectedSlotId;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`flex h-full flex-col justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                active
                                  ? "border-yellow-300 bg-yellow-400/10 text-white shadow-lg shadow-yellow-400/30"
                                  : "border-white/10 text-gray-200 hover:border-yellow-300/60 hover:bg-white/5"
                              }`}
                            >
                              <span className="text-sm font-semibold uppercase tracking-wider">
                                {formatTimeRange(slot)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {selectedService?.provider?.fullName ?? "Personal disponible"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="flex h-full flex-col gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
                <h2 className="text-lg font-semibold text-white">Resumen de la reserva</h2>
                <dl className="mt-4 space-y-3 text-sm text-gray-200">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Servicio</dt>
                    <dd className="mt-1 text-base font-semibold text-white">
                      {selectedService?.name ?? "Selecciona un servicio"}
                    </dd>
                    {selectedService?.provider?.fullName && (
                      <p className="text-xs text-gray-400">
                        Con {selectedService.provider.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Fecha</dt>
                    <dd className="mt-1 capitalize">
                      {selectedSlot
                        ? formatDateLabel(selectedSlot.date)
                        : selectedDate
                          ? formatDateLabel(selectedDate)
                          : "Selecciona una fecha"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Horario</dt>
                    <dd className="mt-1">
                      {selectedSlot ? formatTimeRange(selectedSlot) : "Selecciona un horario"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Duracion</dt>
                    <dd className="mt-1">
                      {selectedService ? `${selectedService.durationMinutes} minutos` : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-gray-400">Total estimado</dt>
                    <dd className="mt-1 text-lg font-semibold text-yellow-300">
                      {selectedService ? `$${Number(selectedService.price).toFixed(2)}` : "-"}
                    </dd>
                  </div>
                </dl>

                <label className="mt-6 block text-sm text-gray-200">
                  Notas para el equipo (opcional)
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    placeholder="Cuentales tus preferencias o indicaciones especiales."
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
                  />
                </label>

                {feedback && (
                  <p
                    className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                      feedback.type === "success"
                        ? "border border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                        : "border border-red-400/40 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {feedback.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!selectedSlot || booking}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-pink-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {booking ? "Reservando..." : "Confirmar reserva"}
                </button>
                <p className="mt-3 text-[0.75rem] text-gray-400">
                  Recibiras un correo con la informacion de tu cita y recordatorios automaticos.
                </p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-slate-900/80 p-6 text-xs text-gray-300">
                <h3 className="text-sm font-semibold text-white">Necesitas ayuda?</h3>
                <p className="mt-2">
                  Puedes consultar tus citas en la seccion{" "}
                  <Link href="/mis-citas" className="text-yellow-300 hover:underline">
                    Mis citas
                  </Link>{" "}
                  o escribirnos por WhatsApp para ajustar detalles.
                </p>
              </div>
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}

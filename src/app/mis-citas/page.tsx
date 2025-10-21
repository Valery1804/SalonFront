"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import { useAuth } from "@/providers/AuthProvider";
import {
  cancelAppointment,
  getMyAppointments,
  type Appointment,
  type AppointmentStatus,
} from "@/service/appointmentService";
import { getMyReviews, type Review } from "@/service/reviewService";
import { getErrorMessage } from "@/utils/error";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistio",
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pendiente: "bg-yellow-400/20 text-yellow-200 border-yellow-300/40",
  confirmada: "bg-emerald-400/20 text-emerald-200 border-emerald-300/40",
  completada: "bg-sky-400/20 text-sky-200 border-sky-300/40",
  cancelada: "bg-red-400/20 text-red-200 border-red-300/40",
  no_asistio: "bg-orange-400/20 text-orange-200 border-orange-300/40",
};

function toDateTime(date: string, time: string): Date {
  const normalized = date.length > 10 ? date : `${date}T${time}`;
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date(`${date}T${time}`);
}

function formatAppointmentDate(date: string, time: string): string {
  const parsed = toDateTime(date, time);
  return parsed.toLocaleString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MisCitas() {
  const { user, initializing } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    if (initializing || !user) {
      if (!user) {
        setAppointments([]);
      }
      setLoading(false);
      return;
    }

    const loadAppointments = async () => {
      setLoading(true);
      setError("");
      setReviewsError("");
      try {
        const appointmentsData = await getMyAppointments();
        setAppointments(appointmentsData);
        try {
          const reviewsData = await getMyReviews();
          setMyReviews(reviewsData);
        } catch (reviewErr: unknown) {
          setReviewsError(
            getErrorMessage(reviewErr, "No pudimos cargar tus reseñas"),
          );
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No pudimos cargar tus citas"));
      } finally {
        setLoading(false);
      }
    };

    void loadAppointments();
  }, [initializing, user]);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const dateA = toDateTime(a.date, a.startTime).getTime();
      const dateB = toDateTime(b.date, b.startTime).getTime();
      return dateB - dateA;
    });
  }, [appointments]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return sortedAppointments.filter((appointment) => {
      const appointmentDate = toDateTime(appointment.date, appointment.startTime);
      const isFuture = appointmentDate.getTime() >= now.getTime();
      return (
        (appointment.status === "pendiente" || appointment.status === "confirmada") &&
        isFuture
      );
    });
  }, [sortedAppointments]);

  const upcomingIds = useMemo(() => new Set(upcoming.map((appointment) => appointment.id)), [upcoming]);

  const history = useMemo(
    () => sortedAppointments.filter((appointment) => !upcomingIds.has(appointment.id)),
    [sortedAppointments, upcomingIds],
  );

  const reviewedAppointmentIds = useMemo(
    () =>
      new Set(
        myReviews
          .filter((review) => Boolean(review.appointmentId))
          .map((review) => review.appointmentId as string),
      ),
    [myReviews],
  );

  const reviewedServiceIds = useMemo(
    () =>
      new Set(
        myReviews
          .filter((review) => !review.appointmentId)
          .map((review) => review.serviceId),
      ),
    [myReviews],
  );

  const hasReviewForAppointment = (appointment: Appointment): boolean => {
    if (appointment.id && reviewedAppointmentIds.has(appointment.id)) {
      return true;
    }
    return reviewedServiceIds.has(appointment.serviceId);
  };

  const openCancelModal = (appointment: Appointment) => {
    setCancelTarget(appointment);
    setCancelReason("");
  };

  const closeCancelModal = () => {
    if (cancelSubmitting) return;
    setCancelTarget(null);
    setCancelReason("");
  };

  const handleCancelAppointment = async () => {
    if (!cancelTarget) return;
    setCancelSubmitting(true);
    setFeedback(null);

    try {
      const updated = await cancelAppointment(cancelTarget.id, {
        reason: cancelReason.trim() || "Cancelado por el cliente",
      });

      setAppointments((prev) =>
        prev.map((appointment) => (appointment.id === updated.id ? updated : appointment)),
      );
      setFeedback({
        type: "success",
        message: "La cita se cancelo correctamente.",
      });
      closeCancelModal();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "No pudimos cancelar la cita. Vuelve a intentarlo."),
      });
    } finally {
      setCancelSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-28 pb-16 text-white">
      <section className="mx-auto max-w-6xl px-4">
        <header className="flex flex-col gap-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-pink-300">Tu agenda</p>
          <h1 className="text-4xl font-semibold">Mis citas</h1>
          <p className="text-sm text-gray-300 sm:text-base">
            Consulta, modifica o cancela tus reservas con SalonClick.
          </p>
        </header>

        {initializing ? (
          <div className="mt-16 flex justify-center">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-4 text-sm text-gray-300 shadow-lg">
              Cargando tus citas...
            </div>
          </div>
        ) : !user ? (
          <div className="mt-16 rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-semibold">Inicia sesion para ver tus citas</h2>
            <p className="mt-3 text-sm text-gray-300">
              Al iniciar sesion podras revisar el historial completo y gestionar tus reservas.
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
          <div className="mt-12 space-y-10">
            {feedback && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  feedback.type === "success"
                    ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                    : "border-red-400/40 bg-red-500/10 text-red-200"
                }`}
              >
                {feedback.message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {reviewsError && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {reviewsError}
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-3xl bg-white/5" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-gray-300">
                Aun no tienes reservas registradas.{" "}
                <Link href="/reservar" className="text-yellow-300 hover:underline">
                  Agenda tu primera cita
                </Link>
                .
              </div>
            ) : (
              <>
                <section>
                  <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Proximas citas</h2>
                      <p className="text-sm text-gray-400">
                        Gestiona las reservas que aun no han ocurrido.
                      </p>
                    </div>
                    <Link
                      href="/reservar"
                      className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs font-semibold text-white transition hover:border-white/40"
                    >
                      Reservar otra cita
                    </Link>
                  </header>

                  {upcoming.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-gray-300">
                      No tienes citas programadas. Agenda una nueva cuando quieras.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {upcoming.map((appointment) => (
                        <article
                          key={appointment.id}
                          className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl transition hover:border-pink-400/50"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex gap-3">
                              {appointment.service?.provider?.profileImage ? (
                                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 border-pink-400/30">
                                  <img
                                    src={appointment.service.provider.profileImage}
                                    alt={appointment.service.provider.fullName || "Prestador"}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : appointment.service?.provider ? (
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border-2 border-white/10 bg-gradient-to-br from-pink-500/20 to-orange-400/20">
                                  <span className="text-lg font-bold text-white">
                                    {appointment.service.provider.firstName?.[0]?.toUpperCase() || "?"}
                                  </span>
                                </div>
                              ) : null}
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {appointment.service?.name ?? "Servicio"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-300">
                                  {formatAppointmentDate(appointment.date, appointment.startTime)}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-wider text-gray-400">
                                  {appointment.service?.provider?.fullName
                                    ? `Con ${appointment.service.provider.fullName}`
                                    : "Personal asignado"}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`inline-flex h-9 items-center rounded-full border px-4 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[appointment.status]}`}
                            >
                              {STATUS_LABELS[appointment.status]}
                            </span>
                          </div>

                          {appointment.notes && (
                            <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-gray-200">
                              <span className="font-semibold text-white">Notas: </span>
                              {appointment.notes}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
                            <span className="rounded-full border border-white/15 px-3 py-1">
                              Duracion: {appointment.service?.durationMinutes ?? "?"} min
                            </span>
                            <span className="rounded-full border border-white/15 px-3 py-1">
                              Creada el{" "}
                              {new Date(appointment.createdAt).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {(appointment.status === "pendiente" ||
                            appointment.status === "confirmada") && (
                            <div className="mt-6 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => openCancelModal(appointment)}
                                className="inline-flex items-center justify-center rounded-full border border-red-400/60 px-5 py-2 text-xs font-semibold text-red-200 transition hover:border-red-300 hover:text-red-100"
                              >
                                Cancelar cita
                              </button>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <header className="mb-4">
                    <h2 className="text-xl font-semibold">Historial</h2>
                    <p className="text-sm text-gray-400">
                      Citas anteriores y canceladas para tu referencia.
                    </p>
                  </header>

                  {history.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-gray-300">
                      Aun no tienes historial de citas.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {history.map((appointment) => (
                        <article
                          key={appointment.id}
                          className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 text-sm text-gray-200"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex gap-3">
                              {appointment.service?.provider?.profileImage ? (
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-pink-400/30">
                                  <img
                                    src={appointment.service.provider.profileImage}
                                    alt={appointment.service.provider.fullName || "Prestador"}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : appointment.service?.provider ? (
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-pink-500/20 to-orange-400/20">
                                  <span className="text-sm font-bold text-white">
                                    {appointment.service.provider.firstName?.[0]?.toUpperCase() || "?"}
                                  </span>
                                </div>
                              ) : null}
                              <div>
                                <h3 className="text-base font-semibold text-white">
                                  {appointment.service?.name ?? "Servicio"}
                                </h3>
                                <p className="text-xs uppercase tracking-wider text-gray-400">
                                  {formatAppointmentDate(appointment.date, appointment.startTime)}
                                </p>
                                {appointment.cancellationReason && (
                                  <p className="mt-2 text-xs text-red-200">
                                    Motivo de cancelacion: {appointment.cancellationReason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className={`inline-flex h-8 items-center rounded-full border px-3 text-[0.65rem] font-semibold uppercase tracking-wider ${STATUS_STYLES[appointment.status]}`}
                        >
                          {STATUS_LABELS[appointment.status]}
                        </span>
                      </div>

                      {appointment.status === "completada" && (
                        <div className="mt-3 flex flex-wrap gap-2">
                      {hasReviewForAppointment(appointment) ? (
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                          Reseña enviada
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs text-gray-200">
                          Comparte tu reseña desde la sección de servicios.
                        </span>
                      )}
                    </div>
                  )}
                    </article>
                  ))}
                </div>
              )}
            </section>
              </>
            )}
          </div>
        )}
      </section>

      <Modal open={cancelTarget !== null} onClose={closeCancelModal}>
        <div className="space-y-4 text-white">
          <header>
            <h3 className="text-xl font-semibold">Cancelar cita</h3>
            <p className="mt-1 text-sm text-gray-300">
              Cuentanos el motivo para notificar al personal. Puedes reprogramar cuando quieras.
            </p>
          </header>

          <label className="block text-sm text-gray-200">
            Motivo (opcional)
            <textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
              placeholder="Escribe el motivo de la cancelacion..."
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeCancelModal}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35"
              disabled={cancelSubmitting}
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleCancelAppointment}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-red-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={cancelSubmitting}
            >
              {cancelSubmitting ? "Cancelando..." : "Confirmar cancelacion"}
            </button>
          </div>
        </div>
      </Modal>

    </main>
  );
}

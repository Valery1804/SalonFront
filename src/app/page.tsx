"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import {
  getActiveServices,
  type ServiceResponse,
} from "@/service/serviceService";
import { getErrorMessage } from "@/utils/error";
import Modal from "@/components/Modal";
import { useAuth } from "@/providers/AuthProvider";
import reviewService, { type Review } from "@/service/reviewService";
export default function Home() {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState("");
  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError("");
      try {
        const data = await getActiveServices();
        setServices(data.slice(0, 6));
      } catch (err: unknown) {
        setServicesError(
          getErrorMessage(err, "No pudimos cargar los servicios"),
        );
      } finally {
        setServicesLoading(false);
      }
    };
    void loadServices();
  }, []);
  useEffect(() => {
    const loadTestimonials = async () => {
      setTestimonialsLoading(true);
      setTestimonialsError("");
      try {
        const data = await reviewService.getPublicReviews();
        const withComment = data.filter((review) =>
          Boolean(review.comment && review.comment.trim().length > 0),
        );
        setTestimonials(withComment.slice(0, 6));
      } catch (err: unknown) {
        setTestimonialsError(
          getErrorMessage(err, "No pudimos cargar los testimonios"),
        );
      } finally {
        setTestimonialsLoading(false);
      }
    };
    void loadTestimonials();
  }, []);
  const handleServiceMetricsChange = (
    serviceId: string,
    metrics: { averageRating: number; totalReviews: number },
  ) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              averageRating: metrics.averageRating,
              reviewsCount: metrics.totalReviews,
            }
          : service,
      ),
    );
  };
  return (
    <main className="bg-slate-900 text-white">
      <HeroSection />
      <Highlights />
      <ServicesSection
        services={services}
        loading={servicesLoading}
        error={servicesError}
        onServiceMetricsChange={handleServiceMetricsChange}
      />
      <GallerySection />
      <ExperienceSection />
      <TestimonialsSection
        reviews={testimonials}
        loading={testimonialsLoading}
        error={testimonialsError}
      />
      <FinalCta />
    </main>
  );
}
function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center justify-center"
    >
      <div className="absolute inset-0">
        <Image
          src="/salon.jpg"
          alt="Salon de belleza"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-yellow-300">
          Tu estilo, tu tiempo
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-6xl">
          Reserva citas de belleza con un solo clic
        </h1>
        <p className="max-w-2xl text-sm text-gray-200 sm:text-base">
          Descubre profesionales especializados en peluqueria, maquillaje y
          cuidado personal. Agenda en linea y recibe recordatorios automaticos.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/reservar"
            className="rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:shadow-pink-500/50"
          >
            Reservar ahora
          </Link>
          <Link
            href="/#servicios"
            className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-white/40"
          >
            Ver servicios
          </Link>
        </div>
      </div>
    </section>
  );
}
function Highlights() {
  return (
    <section className="border-b border-slate-800 bg-slate-900/60">
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-12 text-sm text-gray-300 sm:grid-cols-3">
        <HighlightCard
          title="Reservas en tiempo real"
          description="Disponibilidad actualizada y confirmaciones instantaneas."
        />
        <HighlightCard
          title="Profesionales verificados"
          description="Prestadores con experiencia y perfil validado por nuestro equipo."
        />
        <HighlightCard
          title="Recordatorios automaticos"
          description="Recibe notificaciones por correo para no olvidar tu cita."
        />
      </div>
    </section>
  );
}
function HighlightCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
      <FaCheckCircle className="mt-1 text-lg text-yellow-300" />
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs text-gray-300">{description}</p>
      </div>
    </div>
  );
}
interface ServicesSectionProps {
  services: ServiceResponse[];
  loading: boolean;
  error: string;
  onServiceMetricsChange?: (
    serviceId: string,
    metrics: { averageRating: number; totalReviews: number },
  ) => void;
}
function ServicesSection({
  services,
  loading,
  error,
  onServiceMetricsChange,
}: ServicesSectionProps) {
  const { user, initializing } = useAuth();
  const [reviewTarget, setReviewTarget] = useState<ServiceResponse | null>(
    null,
  );
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const handleOpenReviewModal = (service: ServiceResponse) => {
    if (initializing) return;
    if (!user) {
      setReviewFeedback({
        type: "error",
        message: "Inicia sesion para dejar una resena.",
      });
      return;
    }
    setReviewFeedback(null);
    setReviewTarget(service);
    setReviewForm({ rating: 5, comment: "" });
    setReviewError("");
  };
  const handleCloseReviewModal = () => {
    setReviewTarget(null);
    setReviewForm({ rating: 5, comment: "" });
    setReviewError("");
  };
  const handleReviewFieldChange = (
    event: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };
  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewTarget) return;
    const serviceId = reviewTarget.id;
    setReviewSubmitting(true);
    setReviewError("");
    let shouldClose = false;
    try {
      await reviewService.createReview({
        serviceId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
          ? reviewForm.comment.trim()
          : undefined,
      });
      let statsError = false;
      if (onServiceMetricsChange) {
        try {
          const stats = await reviewService.getServiceReviewStats(serviceId);
          onServiceMetricsChange(serviceId, {
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews,
          });
        } catch {
          statsError = true;
        }
      }
      setReviewFeedback(
        statsError
          ? {
              type: "error",
              message:
                "La reseña se guardó, pero no pudimos actualizar las estadísticas en pantalla.",
            }
          : { type: "success", message: "Gracias por compartir tu reseña." },
      );
      shouldClose = true;
    } catch (err: unknown) {
      setReviewError(getErrorMessage(err, "No pudimos guardar la reseña"));
    } finally {
      setReviewSubmitting(false);
      if (shouldClose) {
        handleCloseReviewModal();
      }
    }
  };
  return (
    <>
      <section
        id="servicios"
        className="bg-gradient-to-b from-slate-900 to-slate-800 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-pink-300">
              Servicios destacados
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Elige el servicio ideal para ti
            </h2>
            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              Trabajamos con profesionales que cuidan cada detalle de tu
              experiencia.
            </p>
          </div>
          {reviewFeedback && (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${reviewFeedback.type === "success" ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200" : "border-red-400/40 bg-red-500/10 text-red-200"}`}
            >
              {reviewFeedback.message}
            </div>
          )}
          {loading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-3xl bg-white/5"
                />
              ))}
            </div>
          ) : error ? (
            <div className="mt-12 rounded-3xl border border-red-400/40 bg-red-500/10 px-6 py-5 text-center text-sm text-red-200">
              {error}
            </div>
          ) : services.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center text-sm text-gray-300">
              Aun no hay servicios publicados. Vuelve pronto para descubrir
              nuevas opciones.
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl transition hover:border-pink-400/50 hover:shadow-pink-500/20"
                >
                  <h3 className="text-xl font-semibold text-white">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-yellow-300">
                    <FaStar className="text-sm" />
                    {service.reviewsCount > 0 ? (
                      <span>
                        {service.averageRating.toFixed(1)} (
                        {service.reviewsCount})
                      </span>
                    ) : (
                      <span className="text-gray-400">Sin reseñas</span>
                    )}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Duracion {service.durationMinutes} min
                    </span>
                    {service.provider && (
                      <div className="ml-auto flex items-center gap-2">
                        {service.provider.profileImage ? (
                          <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border border-pink-400/30">
                            <img
                              src={service.provider.profileImage}
                              alt={service.provider.fullName || "Prestador"}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-pink-500/20 to-orange-400/20">
                            <span className="text-[0.6rem] font-bold text-white">
                              {service.provider.firstName?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-gray-300">
                          {service.provider.fullName}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-lg font-semibold text-yellow-300">
                      ${Number(service.price).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/reservar"
                        className="text-xs font-semibold text-pink-300 hover:text-orange-300"
                      >
                        Reservar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(service)}
                        className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-pink-400/60"
                        disabled={initializing}
                      >
                        Dejar reseña
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <Modal open={reviewTarget !== null} onClose={handleCloseReviewModal}>
        {reviewTarget && (
          <form onSubmit={handleSubmitReview} className="space-y-5 text-white">
            <header className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-pink-300">
                Califica este servicio
              </p>
              <h3 className="text-xl font-semibold">{reviewTarget.name}</h3>
              <p className="text-sm text-gray-300">
                Tu opinión ayuda a más personas a elegir experiencias de
                calidad.
              </p>
            </header>
            <label className="flex flex-col gap-2 text-sm text-gray-200">
              <span>Calificación</span>
              <select
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewFieldChange}
                className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} {value === 1 ? "estrella" : "estrellas"}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-200">
              <span>Comentario (opcional)</span>
              <textarea
                name="comment"
                rows={4}
                value={reviewForm.comment}
                onChange={handleReviewFieldChange}
                placeholder="Cuéntanos qué te gustó y en qué podemos mejorar."
                className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              />
            </label>
            {reviewError && (
              <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {reviewError}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseReviewModal}
                className="w-full rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 sm:w-auto"
                disabled={reviewSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-pink-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {reviewSubmitting ? "Enviando..." : "Enviar reseña"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
function GallerySection() {
  return (
    <section id="galeria" className="bg-slate-900 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-pink-300">
            Galeria
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Momentos SalonClick
          </h2>
          <p className="mt-3 text-sm text-gray-300">
            Inspira tu proximo look con algunos de nuestros resultados
            favoritos.
          </p>
        </div>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 2600 }}
          pagination={{ clickable: true }}
          loop
          spaceBetween={30}
          slidesPerView={1}
          className="mt-10 rounded-3xl shadow-2xl"
        >
          {[
            { src: "/maquillaje.jpg", alt: "Maquillaje profesional" },
            { src: "/estilo.jpg", alt: "Peinado elegante" },
            { src: "/manicure.jpg", alt: "Manicure" },
            { src: "/barberia.jpg", alt: "Barberia" },
          ].map((item) => (
            <SwiperSlide key={item.src}>
              <Image
                src={item.src}
                alt={item.alt}
                width={900}
                height={520}
                className="h-[480px] w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
function ExperienceSection() {
  return (
    <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-pink-300">
            Experiencia SalonClick
          </p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Una plataforma pensada para clientes y prestadores
          </h2>
          <p className="text-sm text-gray-300 sm:text-base">
            Desde la gestion de servicios hasta la agenda de cada profesional,
            nuestra plataforma digitaliza la experiencia completa. Conectamos
            talento con clientes que buscan confianza, puntualidad y resultados
            de calidad.
          </p>
          <ul className="space-y-3 text-sm text-gray-200">
            {[
              "Prestadores con control total de su disponibilidad",
              "Clientes con historial de citas y recordatorios automaticos",
              "Pagos y precios transparentes antes de confirmar",
              "Soporte rapido y seguimiento post servicio",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <FaCheckCircle className="mt-1 text-sm text-yellow-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 text-sm text-gray-300 sm:grid-cols-2">
          <ExperienceCard
            title="Clientes felices"
            value="3.5k+"
            description="Personas atendidas con excelentes valoraciones."
          />
          <ExperienceCard
            title="Profesionales"
            value="25"
            description="Prestadores activos en distintas especialidades."
          />
          <ExperienceCard
            title="Tasa de retorno"
            value="87%"
            description="Usuarios que vuelven a reservar en SalonClick."
          />
          <ExperienceCard
            title="Tiempo promedio"
            value="48h"
            description="Antelacion con la que se reservan las citas."
          />
        </div>
      </div>
    </section>
  );
}
function ExperienceCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
        {title}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-gray-300">{description}</p>
    </div>
  );
}
function TestimonialsSection({
  reviews,
  loading,
  error,
}: {
  reviews: Review[];
  loading: boolean;
  error: string;
}) {
  const hasReviews = reviews.length > 0;

  return (
    <section className="bg-slate-900 py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-pink-300">
          Testimonios
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
          Lo que dicen nuestros usuarios
        </h2>
        <p className="mt-3 text-sm text-gray-300">
          Clientes y profesionales confian en SalonClick para gestionar su
          tiempo.
        </p>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article
                key={`testimonial-skeleton-${index}`}
                className="flex h-full animate-pulse flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-lg"
              >
                <div className="h-4 w-24 rounded-full bg-white/20" />
                <div className="h-16 rounded-2xl bg-white/10" />
                <div className="mt-auto h-3 w-32 rounded-full bg-white/15" />
              </article>
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 rounded-3xl border border-red-400/40 bg-red-500/10 px-6 py-5 text-sm text-red-200">
            {error}
          </div>
        ) : hasReviews ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {reviews.map((review) => {
              const comment = review.comment?.trim() ?? "";
              const displayName = review.client?.fullName?.trim()
                ? review.client.fullName
                : "Cliente SalonClick";
              const serviceName = review.service?.name?.trim() ?? "";
              return (
                <article
                  key={review.id}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-lg"
                >
                  <header className="flex items-center gap-2 text-yellow-300">
                    {Array.from({
                      length: Math.max(
                        1,
                        Math.min(5, Math.round(review.rating)),
                      ),
                    }).map((_, starIndex) => (
                      <FaStar key={`${review.id}-star-${starIndex}`} />
                    ))}
                    <span className="text-xs text-yellow-200">
                      {review.rating.toFixed(1)} / 5
                    </span>
                  </header>
                  <p className="text-sm text-gray-200">
                    {comment.length > 0 ? comment : "Resena sin comentario."}
                  </p>
                  <footer className="mt-auto text-left text-xs text-gray-300">
                    <p className="font-semibold text-white">{displayName}</p>
                    {serviceName ? <p>{serviceName}</p> : null}
                    <p className="text-[0.65rem] uppercase tracking-wider text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </footer>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-gray-300">
            Aun no hay testimonios publicados. Cuando lleguen nuevas resenas las
            veras aqui.
          </div>
        )}
      </div>
    </section>
  );
}
function FinalCta() {
  return (
    <section className="bg-gradient-to-r from-pink-600 to-orange-500 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 text-center text-white">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Listo para tu proxima cita de belleza?
        </h2>
        <p className="text-sm text-white/90 sm:text-base">
          Crea tu cuenta gratis y comienza a reservar o gestionar tus servicios
          con SalonClick.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm font-semibold">
          <Link
            href="/reservar"
            className="rounded-full bg-white px-6 py-3 text-slate-900 transition hover:bg-yellow-100"
          >
            Reservar ahora
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full border border-white/60 px-6 py-3 text-white transition hover:bg-white/10"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}

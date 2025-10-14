"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import {
  getActiveServices,
  type ServiceResponse,
} from "@/service/serviceService";
import { getErrorMessage } from "@/utils/error";
import type { ProviderType, User } from "@/types/user";
import {
  FaCut,
  FaHandSparkles,
  FaPaintBrush,
  FaUserTie,
} from "react-icons/fa";

interface ProviderCard {
  provider: User;
  services: ServiceResponse[];
}

const PROVIDER_TYPE_META: Record<
  ProviderType,
  { label: string; icon: ReactElement; accent: string }
> = {
  barbero: {
    label: "Barbero",
    icon: <FaUserTie className="text-3xl text-blue-400" />,
    accent: "from-blue-500 to-indigo-500",
  },
  estilista: {
    label: "Estilista",
    icon: <FaCut className="text-3xl text-orange-400" />,
    accent: "from-orange-500 to-pink-500",
  },
  manicurista: {
    label: "Manicurista",
    icon: <FaHandSparkles className="text-3xl text-emerald-400" />,
    accent: "from-emerald-500 to-teal-500",
  },
  maquilladora: {
    label: "Maquilladora",
    icon: <FaPaintBrush className="text-3xl text-fuchsia-400" />,
    accent: "from-fuchsia-500 to-purple-500",
  },
};

export default function PersonalSalon() {
  const [providers, setProviders] = useState<ProviderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProviders = async () => {
      setLoading(true);
      setError("");
      try {
        const activeServices = await getActiveServices();
        const grouped = groupServicesByProvider(activeServices);
        setProviders(grouped);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "No pudimos cargar al personal del salon"));
      } finally {
        setLoading(false);
      }
    };

    void loadProviders();
  }, []);

  const totalServices = useMemo(
    () => providers.reduce((acc, card) => acc + card.services.length, 0),
    [providers],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-28 pb-16 text-white">
      <section className="mx-auto max-w-6xl px-4">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-pink-300">Equipo SalonClick</p>
          <h1 className="text-4xl font-semibold">Conoce a nuestro personal</h1>
          <p className="text-sm text-gray-300 sm:text-base">
            Profesionales apasionados por resaltar tu estilo. Reserva con confianza.
          </p>
        </header>

        {loading ? (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-16 rounded-3xl border border-red-400/40 bg-red-500/10 px-6 py-5 text-center text-sm text-red-200">
            {error}
          </div>
        ) : providers.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center text-sm text-gray-300">
            Estamos actualizando nuestro equipo. Vuelve pronto para descubrir nuevos talentos.
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Especialistas</p>
                <p className="mt-2 text-3xl font-semibold text-white">{providers.length}</p>
                <p className="mt-1 text-xs text-gray-400">Listos para atenderte</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Servicios activos</p>
                <p className="mt-2 text-3xl font-semibold text-white">{totalServices}</p>
                <p className="mt-1 text-xs text-gray-400">Variedad y especializacion</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Atencion personalizada</p>
                <p className="mt-2 text-3xl font-semibold text-white">100%</p>
                <p className="mt-1 text-xs text-gray-400">Calidas manos profesionales</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Reservas faciles</p>
                <p className="mt-2 text-3xl font-semibold text-white">24/7</p>
                <p className="mt-1 text-xs text-gray-400">Agenda en cualquier momento</p>
              </div>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map(({ provider, services: providerServices }) => {
                const meta = provider.providerType
                  ? PROVIDER_TYPE_META[provider.providerType]
                  : null;
                return (
                  <article
                    key={provider.id}
                    className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl transition hover:border-pink-400/50 hover:shadow-pink-500/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        {meta?.icon ?? <FaUserTie className="text-3xl text-pink-400" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {provider.fullName || `${provider.firstName} ${provider.lastName}`}
                        </h2>
                        <p className="text-xs uppercase tracking-wider text-gray-400">
                          {meta?.label ?? "Especialista SalonClick"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-300">
                      {provider.phone && (
                        <p className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs">
                          <span>Contacto directo</span>
                          <a
                            href={`tel:${provider.phone}`}
                            className="text-yellow-300 hover:underline"
                          >
                            {provider.phone}
                          </a>
                        </p>
                      )}
                      <p className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs">
                        <span>Correo</span>
                        <a
                          href={`mailto:${provider.email}`}
                          className="text-yellow-300 hover:underline"
                        >
                          {provider.email}
                        </a>
                      </p>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <h3 className="text-sm font-semibold text-white">Servicios destacados</h3>
                      <ul className="mt-3 space-y-2 text-xs text-gray-300">
                        {providerServices.map((service) => (
                          <li
                            key={service.id}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/70 px-3 py-2"
                          >
                            <span className="font-medium text-white">{service.name}</span>
                            <span className="text-yellow-300">${Number(service.price).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-wider text-gray-400">
                      <span className={`rounded-full border border-white/10 px-3 py-1`}>
                        Experiencia: {providerServices.length} servicios
                      </span>
                      {meta && (
                        <span className={`rounded-full border border-white/10 px-3 py-1`}>
                          Especialidad {meta.label.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function groupServicesByProvider(services: ServiceResponse[]): ProviderCard[] {
  const map = new Map<string, ProviderCard>();

  for (const service of services) {
    const provider = service.provider as User | null | undefined;
    if (!provider) continue;

    if (!map.has(provider.id)) {
      map.set(provider.id, { provider, services: [] });
    }

    map.get(provider.id)!.services.push(service);
  }

  return Array.from(map.values()).sort((a, b) =>
    (a.provider.fullName || a.provider.firstName).localeCompare(
      b.provider.fullName || b.provider.firstName,
    ),
  );
}

"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Modal from "@/components/Modal";
import { getAllUsers, updateUser } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import { useToast } from "@/providers/ToastProvider";
import type { ProviderType, User } from "@/types/user";
import {
  FaCheckCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaPlus,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";

const PROVIDER_OPTIONS: Array<{ value: ProviderType | "todos"; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "barbero", label: "Barberos" },
  { value: "estilista", label: "Estilistas" },
  { value: "manicurista", label: "Manicuristas" },
  { value: "maquilladora", label: "Maquilladoras" },
];

export default function AdminPersonalSalon() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [providerFilter, setProviderFilter] = useState<ProviderType | "todos">(
    "todos",
  );
  const [statusFilter, setStatusFilter] = useState<"todos" | "activos" | "inactivos">(
    "todos",
  );
  const [search, setSearch] = useState("");
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllUsers();
      const staff = data.filter((user) => user.role !== "cliente");
      setUsers(staff);
    } catch (caughtError: unknown) {
      const message = getErrorMessage(
        caughtError,
        "No se pudo cargar el personal del salón",
      );
      setError(message);
      showToast({ variant: "error", description: message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesProvider =
        providerFilter === "todos" || user.providerType === providerFilter;
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activos" && user.isActive) ||
        (statusFilter === "inactivos" && !user.isActive);
      const matchesSearch =
        query.length === 0 ||
        `${user.fullName ?? ""} ${user.email}`.toLowerCase().includes(query);
      return matchesProvider && matchesStatus && matchesSearch;
    });
  }, [providerFilter, search, statusFilter, users]);

  const toggleActive = async () => {
    if (!targetUser) return;
    setProcessing(true);
    try {
      const updated = await updateUser(targetUser.id, {
        isActive: !targetUser.isActive,
      });
      setUsers((prev) =>
        prev.map((user) => (user.id === updated.id ? updated : user)),
      );
      showToast({
        variant: "success",
        title: `Usuario ${updated.isActive ? "habilitado" : "deshabilitado"}`,
        description: `${updated.fullName ?? updated.email} ahora está ${
          updated.isActive ? "activo" : "inactivo"
        }.`,
      });
      setTargetUser(null);
    } catch (caughtError: unknown) {
      const message = getErrorMessage(
        caughtError,
        "No se pudo actualizar el estado del usuario",
      );
      setError(message);
      showToast({ variant: "error", description: message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Equipo SalonClick
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Coordina tu talento desde un solo lugar
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              Filtra por especialidad, verifica el estado de sus cuentas y mantén
              actualizada la base de talento disponible para tus clientes.
            </p>
          </div>
          <Link
            href="/admin/personal/agregar"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
          >
            <FaPlus className="text-sm" />
            Agregar nuevo personal
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            />
          </div>
          <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white">
            <select
              value={providerFilter}
              onChange={(event) =>
                setProviderFilter(event.target.value as ProviderType | "todos")
              }
              className="w-full bg-transparent py-2 focus:outline-none"
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as typeof statusFilter)
              }
              className="w-full bg-transparent py-2 focus:outline-none"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-gray-300">
          No se encontraron integrantes con esos criterios. Intenta ampliar los filtros o
          agrega nuevos miembros al equipo.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl transition hover:border-pink-400/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    {user.providerType
                      ? user.providerType.replace("_", " ")
                      : user.role === "admin"
                        ? "Administrador"
                        : "Equipo"}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-white">
                    {user.fullName?.trim() ||
                      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                      user.email}
                  </h3>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    user.isActive
                      ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                      : "border border-red-400/40 bg-red-500/10 text-red-200"
                  }`}
                >
                  {user.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <InfoRow
                  icon={<FaEnvelope className="text-pink-300" />}
                  label="Correo"
                  value={user.email}
                />
                <InfoRow
                  icon={<FaPhoneAlt className="text-cyan-300" />}
                  label="Teléfono"
                  value={user.phone ?? "Sin registrar"}
                />
                <InfoRow
                  icon={<FaCheckCircle className="text-yellow-300" />}
                  label="Verificación"
                  value={user.emailVerified ? "Correo verificado" : "Pendiente"}
                />
              </div>

              <div className="mt-auto flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setTargetUser(user)}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 font-semibold transition hover:border-white/35 ${
                    user.isActive
                      ? "border-red-400/40 text-red-200 hover:text-red-100"
                      : "border-emerald-400/40 text-emerald-200 hover:text-emerald-100"
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <FaUserTimes className="text-xs" />
                      Deshabilitar
                    </>
                  ) : (
                    <>
                      <FaUserCheck className="text-xs" />
                      Habilitar
                    </>
                  )}
                </button>
                <Link
                  href={`mailto:${user.email}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 font-semibold text-white transition hover:border-white/35"
                >
                  Contactar
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={targetUser !== null} onClose={() => setTargetUser(null)}>
        <div className="space-y-4 text-white">
          <header>
            <h3 className="text-2xl font-semibold">
              {targetUser?.isActive ? "Deshabilitar" : "Habilitar"} acceso
            </h3>
            <p className="mt-1 text-sm text-gray-300">
              Esta acción cambiará el estado de acceso de{" "}
              <strong>{targetUser?.fullName ?? targetUser?.email}</strong>.
            </p>
          </header>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200">
            {targetUser?.email}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setTargetUser(null)}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              disabled={processing}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void toggleActive()}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-pink-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={processing}
            >
              {processing ? "Actualizando..." : targetUser?.isActive ? "Deshabilitar" : "Habilitar"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <p className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950/50">
        {icon}
      </span>
      <span className="text-xs text-white/60">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </p>
  );
}

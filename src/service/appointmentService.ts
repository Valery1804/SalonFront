import api from "./api";
import { getAxiosError } from "@/utils/error";
import type { ServiceResponse } from "./serviceService";
import type { User } from "@/types/user";

export type AppointmentStatus =
  | "pendiente"
  | "confirmada"
  | "completada"
  | "cancelada"
  | "no_asistio";

export interface Appointment {
  id: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  client?: User;
  staff?: User;
  service?: ServiceResponse;
}

export interface CreateAppointmentPayload {
  staffId: string;
  serviceId: string;
  date: string;
  startTime: string;
  notes?: string;
  clientId?: string;
}

export interface CancelAppointmentPayload {
  reason: string;
}

function extractMessage(error: unknown, fallback: string): string {
  const axiosError = getAxiosError<{ message?: string | string[] }>(error);
  const message =
    axiosError?.response?.data?.message ??
    axiosError?.message ??
    fallback;
  return Array.isArray(message) ? message.join(", ") : String(message);
}

export async function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<Appointment> {
  try {
    const { data } = await api.post<Appointment>("/appointments", payload);
    return data;
  } catch (error: unknown) {
    throw new Error(extractMessage(error, "No se pudo crear la cita"));
  }
}

export async function getMyAppointments(): Promise<Appointment[]> {
  try {
    const { data } = await api.get<Appointment[]>("/appointments/my-appointments");
    return data;
  } catch (error: unknown) {
    throw new Error(extractMessage(error, "No se pudieron cargar tus citas"));
  }
}

export async function getStaffAppointments(staffId: string): Promise<Appointment[]> {
  try {
    const { data } = await api.get<Appointment[]>(`/appointments/by-staff/${staffId}`);
    return data;
  } catch (error: unknown) {
    throw new Error(extractMessage(error, "No se pudieron cargar las citas del personal"));
  }
}

export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const { data } = await api.get<Appointment[]>("/appointments");
    return data;
  } catch (error: unknown) {
    throw new Error(extractMessage(error, "No se pudieron cargar las citas"));
  }
}

export async function cancelAppointment(
  appointmentId: string,
  payload: CancelAppointmentPayload,
): Promise<Appointment> {
  try {
    const { data } = await api.post<Appointment>(
      `/appointments/${appointmentId}/cancel`,
      payload,
    );
    return data;
  } catch (error: unknown) {
    throw new Error(extractMessage(error, "No se pudo cancelar la cita"));
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  try {
    const { data } = await api.patch<Appointment>(
      `/appointments/${appointmentId}/status`,
      { status },
    );
    return data;
  } catch (error: unknown) {
    throw new Error(extractMessage(error, "No se pudo actualizar el estado de la cita"));
  }
}

export interface AppointmentStatistics {
  total: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
  noAsistio: number;
}

export async function getAppointmentsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Appointment[]> {
  try {
    const { data } = await api.get<Appointment[]>("/appointments/by-date-range", {
      params: { startDate, endDate },
    });
    return data;
  } catch (error: unknown) {
    throw new Error(extractMessage(error, "No se pudieron cargar las citas del rango"));
  }
}

export async function getAppointmentStatistics(
  startDate: string,
  endDate: string,
): Promise<AppointmentStatistics> {
  try {
    const { data } = await api.get<AppointmentStatistics>("/appointments/statistics", {
      params: { startDate, endDate },
    });
    return data;
  } catch (error: unknown) {
    throw new Error(extractMessage(error, "No se pudieron obtener las estadísticas"));
  }
}

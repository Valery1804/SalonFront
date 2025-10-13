import api from "./api";
import { getAxiosError } from "@/utils/error";
import type { ServiceResponse } from "./serviceService";

export type ServiceSlotStatus =
  | "available"
  | "reserved"
  | "blocked"
  | "completed"
  | "cancelled";

export interface ServiceSlot {
  id: string;
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ServiceSlotStatus;
  clientId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  service?: ServiceResponse;
}

export interface GenerateSlotsPayload {
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
}

export async function generateServiceSlots(
  payload: GenerateSlotsPayload,
): Promise<ServiceSlot[]> {
  try {
    const { data } = await api.post<ServiceSlot[]>(
      "/service-slots/generate",
      payload,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const message =
      axiosError?.response?.data?.message ??
      axiosError?.message ??
      "Error al generar slots";
    throw new Error(
      Array.isArray(message) ? message.join(", ") : String(message),
    );
  }
}

export async function getMyServiceSlots(date?: string): Promise<ServiceSlot[]> {
  try {
    const { data } = await api.get<ServiceSlot[]>("/service-slots/mine", {
      params: date ? { date } : undefined,
    });
    return data;
  } catch (error: unknown) {
    throw new Error("No se pudieron cargar tus slots");
  }
}

export interface UpdateSlotStatusPayload {
  status: ServiceSlotStatus;
  notes?: string;
}

export async function updateServiceSlotStatus(
  slotId: string,
  payload: UpdateSlotStatusPayload,
): Promise<ServiceSlot> {
  try {
    const { data } = await api.patch<ServiceSlot>(
      `/service-slots/${slotId}/status`,
      payload,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const message =
      axiosError?.response?.data?.message ??
      axiosError?.message ??
      "Error al actualizar el slot";
    throw new Error(
      Array.isArray(message) ? message.join(", ") : String(message),
    );
  }
}

export async function getAvailableSlotsByService(
  serviceId: string,
  date?: string,
): Promise<ServiceSlot[]> {
  try {
    const { data } = await api.get<ServiceSlot[]>("/service-slots/available", {
      params: {
        serviceId,
        ...(date ? { date } : {}),
      },
    });
    return data;
  } catch {
    throw new Error("No se pudo obtener la disponibilidad");
  }
}

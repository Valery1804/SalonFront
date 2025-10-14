import api from "./api";
import { getAxiosError } from "@/utils/error";
import type { User } from "@/types/user";

export interface CreateServiceDTO {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface ServiceResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  providerId: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: User | null;
}

export async function createService(serviceData: CreateServiceDTO): Promise<ServiceResponse> {
  try {
    const { data } = await api.post<ServiceResponse>("/services", serviceData);
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;

    if (status === 409) {
      throw new Error("Ya existe un servicio con ese nombre");
    }

    throw new Error("Error al crear servicio");
  }
}

export async function getAllServices(): Promise<ServiceResponse[]> {
  try {
    const { data } = await api.get<ServiceResponse[]>("/services");
    return data;
  } catch {
    throw new Error("Error al obtener servicios");
  }
}

export async function getActiveServices(): Promise<ServiceResponse[]> {
  try {
    const { data } = await api.get<ServiceResponse[]>("/services/active");
    return data;
  } catch {
    throw new Error("Error al obtener servicios activos");
  }
}

export async function updateService(
  serviceId: string,
  payload: Partial<CreateServiceDTO>,
): Promise<ServiceResponse> {
  try {
    const { data } = await api.patch<ServiceResponse>(`/services/${serviceId}`, payload);
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;
    if (status === 404) {
      throw new Error("Servicio no encontrado");
    }
    if (status === 409) {
      throw new Error("Ya existe un servicio con ese nombre");
    }
    throw new Error("No se pudo actualizar el servicio");
  }
}

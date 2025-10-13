import api from "./api";
import { getAxiosError } from "@/utils/error";

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
  createdAt: string;
  updatedAt: string;
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

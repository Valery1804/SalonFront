import api from "./api";

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

/* Crear nuevo servicio */
export async function createService(serviceData: CreateServiceDTO): Promise<ServiceResponse> {
  try {
    const { data } = await api.post<ServiceResponse>("/services", serviceData);
    return data;
  } catch (error: any) {
    if (error.response) {
      const { status } = error.response;
      if (status === 409) throw new Error("Ya existe un servicio con ese nombre");
    }
    throw new Error("Error al crear servicio");
  }
}

import api from "./api";
import { getAxiosError } from "@/utils/error";

export interface ReviewAuthor {
  id: string;
  fullName?: string;
}

export interface ReviewServiceSummary {
  id: string;
  name?: string;
}

export interface Review {
  id: string;
  serviceId: string;
  clientId: string;
  rating: number;
  comment?: string | null;
  appointmentId?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: ReviewAuthor | null;
  service?: ReviewServiceSummary | null;
}

export interface CreateReviewDTO {
  serviceId: string;
  rating: number;
  comment?: string;
  appointmentId?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}

export async function createReview(payload: CreateReviewDTO): Promise<Review> {
  try {
    const { data } = await api.post<Review>("/reviews", payload);
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const message =
      typeof axiosError?.response?.data?.message === "string"
        ? axiosError.response.data.message
        : axiosError?.message ?? "No se pudo guardar la resena";
    throw new Error(
      Array.isArray(message) ? message.join(", ") : String(message),
    );
  }
}

export async function getServiceReviews(serviceId: string): Promise<Review[]> {
  try {
    const { data } = await api.get<Review[]>(
      `/reviews/by-service/${serviceId}`,
    );
    return data;
  } catch {
    throw new Error("No se pudieron obtener las resenas del servicio");
  }
}

export async function getServiceReviewStats(
  serviceId: string,
): Promise<ReviewStats> {
  try {
    const { data } = await api.get<ReviewStats>(
      `/reviews/service-stats/${serviceId}`,
    );
    return data;
  } catch {
    throw new Error("No se pudieron obtener las estadisticas de resenas");
  }
}

export async function getMyReviews(): Promise<Review[]> {
  try {
    const { data } = await api.get<Review[]>("/reviews/my-reviews");
    return data;
  } catch {
    throw new Error("No se pudieron obtener tus resenas");
  }
}

export async function getPublicReviews(): Promise<Review[]> {
  try {
    const { data } = await api.get<Review[]>("/reviews");
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const message =
      axiosError?.response?.data?.message ??
      axiosError?.message ??
      "No se pudieron obtener los testimonios";
    throw new Error(
      Array.isArray(message) ? message.join(", ") : String(message),
    );
  }
}

export const reviewService = {
  createReview,
  getServiceReviews,
  getServiceReviewStats,
  getMyReviews,
  getPublicReviews,
};

export default reviewService;

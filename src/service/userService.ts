import api from "./api";
import { getAxiosError } from "@/utils/error";
import type { ProviderType, User, UserRole } from "@/types/user";

// Re-export types for external use
export type { User, UserRole, ProviderType } from "@/types/user";

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  providerType?: ProviderType;
  profileImage?: string;
}

export type UserResponse = User;

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  providerType?: ProviderType | null;
  profileImage?: string;
  isActive?: boolean;
  emailVerificationToken?: string;
}

export interface UpdateProfileDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  providerType?: ProviderType | null;
  profileImage?: string;
  isActive?: boolean;
  emailVerificationToken?: string;
}

export async function createUser(userData: CreateUserDTO): Promise<UserResponse> {
  try {
    const { data } = await api.post<UserResponse>("/users", userData);
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;

    if (status === 400) throw new Error("Datos invalidos");
    if (status === 409) throw new Error("El email ya esta registrado");

    throw new Error("Error al crear usuario");
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data } = await api.get<User[]>("/users");
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 401) {
      throw new Error("No autorizado");
    }

    throw new Error("Error al obtener los usuarios");
  }
}

export async function getUserById(id: string): Promise<UserResponse> {
  try {
    const { data } = await api.get<UserResponse>(`/users/${id}`);
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 404) {
      throw new Error("Usuario no encontrado");
    }

    throw new Error("Error al obtener usuario");
  }
}

export async function updateUser(id: string, userData: UpdateUserDTO): Promise<UserResponse> {
  try {
    const { data } = await api.patch<UserResponse>(`/users/${id}`, userData);
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;

    if (status === 404) throw new Error("Usuario no encontrado");
    if (status === 409) throw new Error("El email ya esta registrado");

    throw new Error("Error al actualizar usuario");
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await api.delete(`/users/${id}`);
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 404) {
      throw new Error("Usuario no encontrado");
    }

    throw new Error("Error al eliminar usuario");
  }
}

export async function getMyProfile(): Promise<UserResponse> {
  try {
    const { data } = await api.get<UserResponse>("/users/profile/me");
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 401) {
      throw new Error("No autorizado");
    }

    throw new Error("Error al obtener el perfil del usuario");
  }
}

export async function updateMyProfile(profileData: UpdateProfileDTO): Promise<UserResponse> {
  try {
    const { data } = await api.patch<UserResponse>("/users/profile/me", profileData);
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 401) {
      throw new Error("No autorizado");
    }

    throw new Error("Error al actualizar perfil");
  }
}

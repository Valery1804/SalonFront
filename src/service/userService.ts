import api from "./api";
import { User } from "./authService";



export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}


/* CREATE USER */
export async function createUser(userData: CreateUserDTO): Promise<UserResponse> {
  try {
    const { data } = await api.post<UserResponse>("/users", userData);
    return data;
  } catch (error: any) {
    if (error.response) {
      const { status } = error.response;
      if (status === 400) throw new Error("Datos inválidos");
      if (status === 409) throw new Error("El email ya está registrado");
    }
    throw new Error("Error al crear usuario");
  }
}

/**
 * Obtener todos los usuarios
 * @returns Lista de usuarios
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data } = await api.get<User[]>("/users");
    return data;
  } catch (error: any) {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) throw new Error("No autorizado");
    }
    throw new Error("Error al obtener los usuarios");
  }
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: "cliente" | "admin";
  isActive?: boolean;
  emailVerificationToken?: string;
}

/* Obtener usuario por ID */
export async function getUserById(id: string): Promise<UserResponse> {
  try {
    const { data } = await api.get<UserResponse>(`/users/${id}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) throw new Error("Usuario no encontrado");
    throw new Error("Error al obtener usuario");
  }
}

/* Actualizar usuario */
export async function updateUser(id: string, userData: UpdateUserDTO): Promise<UserResponse> {
  try {
    const { data } = await api.patch<UserResponse>(`/users/${id}`, userData);
    return data;
  } catch (error: any) {
    if (error.response) {
      const { status } = error.response;
      if (status === 404) throw new Error("Usuario no encontrado");
      if (status === 409) throw new Error("El email ya está registrado");
    }
    throw new Error("Error al actualizar usuario");
  }
}



/* Eliminar usuario */
export async function deleteUser(id: string): Promise<void> {
  try {
    await api.delete(`/users/${id}`);
    // Si responde 204, todo bien, no devuelve data
  } catch (error: any) {
    if (error.response?.status === 404) throw new Error("Usuario no encontrado");
    throw new Error("Error al eliminar usuario");
  }
}

/* Obtener perfil del usuario autenticado */
export async function getMyProfile(): Promise<UserResponse> {
  try {
    const { data } = await api.get<UserResponse>("/users/profile/me");
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) throw new Error("No autorizado");
    throw new Error("Error al obtener el perfil del usuario");
  }
}


/* DTO para actualizar perfil */
export interface UpdateProfileDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: "cliente" | "admin";
  isActive?: boolean;
  emailVerificationToken?: string;
}

/* Actualizar perfil del usuario autenticado */
export async function updateMyProfile(profileData: UpdateProfileDTO): Promise<UserResponse> {
  try {
    const { data } = await api.patch<UserResponse>("/users/profile/me", profileData);
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) throw new Error("No autorizado");
    throw new Error("Error al actualizar perfil");
  }
}

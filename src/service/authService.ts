import api from "./api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    return data;
  } catch (error: any) {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) throw new Error("Credenciales inválidas");
      if (status === 400) throw new Error("Datos inválidos");
    }
    throw new Error("Error al iniciar sesión");
  }
}

export async function register(dataUser: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/auth/register", dataUser);
    return data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error("El email ya está registrado");
    }
    throw new Error("Error al registrar usuario");
  }
}

import api from "./api";
import { getAxiosError } from "@/utils/error";

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
  role?: string; // Puede ser 'admin', 'cliente', 'prestador_servicio', etc.
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
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;

    if (status === 401) throw new Error("Credenciales invalidas");
    if (status === 400) throw new Error("Datos invalidos");
    if (status === 403) throw new Error("Tu cuenta no esta verificada. Revisa tu correo.");

    throw new Error("Error al iniciar sesion");
  }
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export async function register(dataUser: RegisterPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/auth/register", dataUser);
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 409) {
      throw new Error("El email ya esta registrado");
    }

    throw new Error("Error al registrar usuario");
  }
}

export async function resendVerification(): Promise<string> {
  try {
    const { data } = await api.post<{ message: string }>("/auth/resend-verification");
    return data.message;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;

    if (status === 400) throw new Error("El correo ya esta verificado");
    if (status === 404) throw new Error("Usuario no encontrado");

    throw new Error("Error al reenviar el correo de verificacion");
  }
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string
): Promise<string> {
  try {
    const { data } = await api.post<{ message: string }>("/auth/reset-password", {
      token,
      password,
      confirmPassword,
    });

    return data.message;
  } catch {
    throw new Error("Error al restablecer la contrasena");
  }
}

export async function getProfile(): Promise<User> {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No autenticado");

    const { data } = await api.get<User>("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 401) {
      throw new Error("No autorizado o sesion expirada");
    }

    throw new Error("Error al obtener perfil");
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

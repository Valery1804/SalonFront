import api from "./api";
import { getAxiosError } from "@/utils/error";
import type { User } from "@/types/user";
export type { User, UserRole, ProviderType } from "@/types/user";

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
    // Forzar rol cliente en el registro normal
    const { data } = await api.post<AuthResponse>("/auth/register", { ...dataUser, role: "cliente" });
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;
    const message = (axiosError?.response?.data as { message?: string | string[] })?.message;

    // Mostrar mensaje específico del backend si está disponible
    if (status === 409) {
      throw new Error("El email ya esta registrado");
    }
    if (status === 400) {
      // Si el backend envía un mensaje específico, úsalo
      if (message) {
        if (Array.isArray(message)) {
          throw new Error(message[0]); // ValidationPipe devuelve array de errores
        }
        throw new Error(message);
      }
      throw new Error("Los datos proporcionados no son válidos. Revisa los campos.");
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

export async function requestPasswordReset(email: string): Promise<string> {
  try {
    const { data } = await api.post<{ message: string }>("/auth/forgot-password", { email });
    return data.message;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;

    if (status === 404) throw new Error("No encontramos un usuario con ese correo");

    throw new Error("No pudimos procesar la solicitud");
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

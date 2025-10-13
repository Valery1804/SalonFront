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

/* 🔐 LOGIN */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    return data;
  } catch (error: any) {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) throw new Error("Credenciales inválidas");
      if (status === 400) throw new Error("Datos inválidos");
      if (status === 403) throw new Error("Tu cuenta no está verificada. Revisa tu correo.");
    }
    throw new Error("Error al iniciar sesión");
  }
}

/* 🧾 REGISTRO */
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

/* 📩 REENVIAR VERIFICACIÓN DE EMAIL */
export async function resendVerification(): Promise<string> {
  try {
    const { data } = await api.post<{ message: string }>("/auth/resend-verification");
    return data.message;
  } catch (error: any) {
    if (error.response?.status === 400) throw new Error("El correo ya está verificado");
    if (error.response?.status === 404) throw new Error("Usuario no encontrado");
    throw new Error("Error al reenviar el correo de verificación");
  }
}

/* 🔁 RESTABLECER CONTRASEÑA (con token) */
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
  } catch (error: any) {
    throw new Error("Error al restablecer la contraseña");
  }
}

/* 👤 OBTENER PERFIL DEL USUARIO AUTENTICADO */
export async function getProfile(): Promise<User> {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No autenticado");

    const { data } = await api.get<User>("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) throw new Error("No autorizado o sesión expirada");
    throw new Error("Error al obtener perfil");
  }
}

/* 🚪 CERRAR SESIÓN */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export type UserRole = "admin" | "cliente" | "prestador_servicio";

export type ProviderType =
  | "barbero"
  | "estilista"
  | "manicurista"
  | "maquilladora";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  providerType: ProviderType | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

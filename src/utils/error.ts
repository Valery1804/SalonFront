import type { AxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback = "OcurriÃ³ un error inesperado"): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
}

export function getAxiosError<T = unknown>(error: unknown): AxiosError<T> | null {
  if (typeof error === "object" && error !== null && "isAxiosError" in error) {
    return error as AxiosError<T>;
  }

  return null;
}

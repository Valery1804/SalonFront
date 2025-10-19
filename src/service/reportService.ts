import api from "./api";
import { getAxiosError } from "@/utils/error";

export interface ReportData {
  month: string;
  appointments: number;
  revenue: number;
  clients: number;
  avgDuration: number;
}

export interface ServiceStats {
  name: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface MonthlyReport {
  data: ReportData[];
  serviceStats: ServiceStats[];
  summary: {
    totalAppointments: number;
    totalRevenue: number;
    totalClients: number;
    avgDuration: number;
    appointmentGrowth: number;
    revenueGrowth: number;
    clientGrowth: number;
  };
}

export interface ReportFilters {
  period: "6-months" | "12-months" | "current-year";
  year?: number;
  startDate?: string;
  endDate?: string;
}

export async function getMonthlyReports(filters: ReportFilters): Promise<MonthlyReport> {
  try {
    const { data } = await api.get<MonthlyReport>("/reports/monthly", {
      params: filters
    });
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 401) {
      throw new Error("No autorizado");
    }
    throw new Error("Error al obtener reportes mensuales");
  }
}

export async function getAppointmentReports(filters: ReportFilters): Promise<ReportData[]> {
  try {
    const { data } = await api.get<ReportData[]>("/reports/appointments", {
      params: filters
    });
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 401) {
      throw new Error("No autorizado");
    }
    throw new Error("Error al obtener reportes de citas");
  }
}

export async function getServiceReports(filters: ReportFilters): Promise<ServiceStats[]> {
  try {
    const { data } = await api.get<ServiceStats[]>("/reports/services", {
      params: filters
    });
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 401) {
      throw new Error("No autorizado");
    }
    throw new Error("Error al obtener reportes de servicios");
  }
}

export async function exportReportPDF(filters: ReportFilters): Promise<Blob> {
  try {
    const { data } = await api.get("/reports/export/pdf", {
      params: filters,
      responseType: 'blob'
    });
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 401) {
      throw new Error("No autorizado");
    }
    throw new Error("Error al exportar reporte en PDF");
  }
}

export async function exportReportExcel(filters: ReportFilters): Promise<Blob> {
  try {
    const { data } = await api.get("/reports/export/excel", {
      params: filters,
      responseType: 'blob'
    });
    return data;
  } catch (error: unknown) {
    const axiosError = getAxiosError(error);
    if (axiosError?.response?.status === 401) {
      throw new Error("No autorizado");
    }
    throw new Error("Error al exportar reporte en Excel");
  }
}

// Función helper para descargar archivos
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

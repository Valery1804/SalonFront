"use client";

import { useState, useEffect } from "react";
import { FiTrendingUp, FiCalendar, FiDollarSign, FiUsers, FiClock, FiBarChart, FiDownload } from "react-icons/fi";
import { getMonthlyReports, exportReportPDF, exportReportExcel, downloadFile, type ReportFilters } from "@/service/reportService";

interface ReportData {
  month: string;
  appointments: number;
  revenue: number;
  clients: number;
  avgDuration: number;
}

interface ServiceStats {
  name: string;
  count: number;
  percentage: number;
  revenue: number;
}

export default function AdminReportes() {
  const [selectedPeriod, setSelectedPeriod] = useState<"6-months" | "12-months" | "current-year">("6-months");
  const [selectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const [summary, setSummary] = useState({
    appointmentGrowth: 0,
    revenueGrowth: 0,
    clientGrowth: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalClients: 0,
    avgDuration: 0
  });

  const currentMonth = reportData[reportData.length - 1];
  const previousMonth = reportData[reportData.length - 2];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ReportFilters = {
        period: selectedPeriod,
        year: selectedYear
      };
      
      const data = await getMonthlyReports(filters);
      setReportData(data.data);
      setServiceStats(data.serviceStats);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      const filters: ReportFilters = {
        period: selectedPeriod,
        year: selectedYear
      };
      
      const blob = await exportReportPDF(filters);
      const filename = `reporte-salon-${selectedPeriod}-${selectedYear}.pdf`;
      downloadFile(blob, filename);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al exportar PDF');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      const filters: ReportFilters = {
        period: selectedPeriod,
        year: selectedYear
      };
      
      const blob = await exportReportExcel(filters);
      const filename = `reporte-salon-${selectedPeriod}-${selectedYear}.xlsx`;
      downloadFile(blob, filename);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al exportar Excel');
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedPeriod, selectedYear]);

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
            Reportes y Analíticas
          </h1>
          <p className="text-gray-300 text-lg">Análisis detallado del rendimiento de tu salón</p>
        </div>

        {/* Period Selector */}
        <div className="mb-8 flex items-center gap-4">
          <FiCalendar className="text-pink-400 text-xl" />
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "6-months" | "12-months" | "current-year")}
            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={loading}
          >
            <option value="6-months">Últimos 6 meses</option>
            <option value="12-months">Últimos 12 meses</option>
            <option value="current-year">Año actual ({selectedYear})</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400">Cargando reportes...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-400">Error: {error}</p>
            <button 
              onClick={loadReports}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Key Metrics */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <FiCalendar className="text-pink-400 text-2xl" />
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  summary.appointmentGrowth >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {summary.appointmentGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{currentMonth?.appointments || summary.totalAppointments}</div>
              <div className="text-gray-400 text-sm">Citas este período</div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <FiDollarSign className="text-green-400 text-2xl" />
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  summary.revenueGrowth >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {summary.revenueGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatCurrency(currentMonth?.revenue || summary.totalRevenue)}</div>
              <div className="text-gray-400 text-sm">Ingresos este período</div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <FiUsers className="text-blue-400 text-2xl" />
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  summary.clientGrowth >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {summary.clientGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{currentMonth?.clients || summary.totalClients}</div>
              <div className="text-gray-400 text-sm">Clientes únicos</div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <FiClock className="text-orange-400 text-2xl" />
                <FiTrendingUp className="text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{currentMonth?.avgDuration || summary.avgDuration}min</div>
              <div className="text-gray-400 text-sm">Duración promedio</div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Trend Chart */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FiBarChart className="text-pink-400 text-xl" />
                <h3 className="text-xl font-semibold text-white">Tendencia Mensual</h3>
              </div>
              <div className="space-y-4">
                {reportData.map((data, index) => {
                  const maxAppointments = Math.max(...reportData.map(d => d.appointments));
                const width = (data.appointments / maxAppointments) * 100;
                  return (
                    <div key={data.month} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-gray-300">{data.month}</div>
                      <div className="flex-1 bg-slate-700 rounded-full h-6 relative">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-orange-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${width}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {data.appointments}
                        </span>
                      </div>
                      <div className="w-24 text-sm text-gray-300 text-right">
                        {formatCurrency(data.revenue)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Services Performance */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Servicios Más Populares</h3>
              <div className="space-y-4">
                {serviceStats.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{service.name}</span>
                        <span className="text-gray-400 text-sm">{service.count} citas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              index === 0 ? 'bg-pink-500' :
                              index === 1 ? 'bg-orange-500' :
                              index === 2 ? 'bg-blue-500' :
                              index === 3 ? 'bg-green-500' : 'bg-gray-500'
                            }`}
                            style={{ width: `${service.percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-12">{service.percentage}%</span>
                      </div>
                      <div className="text-gray-400 text-xs mt-1">{formatCurrency(service.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        {!loading && !error && (
          <div className="mt-8 flex justify-end gap-4">
            <button 
              onClick={handleExportPDF}
              disabled={exporting === 'pdf'}
              className="bg-slate-800 border border-slate-600 hover:border-slate-500 text-gray-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className={exporting === 'pdf' ? 'animate-spin' : ''} />
              {exporting === 'pdf' ? 'Exportando...' : 'Exportar PDF'}
            </button>
            <button 
              onClick={handleExportExcel}
              disabled={exporting === 'excel'}
              className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload className={exporting === 'excel' ? 'animate-spin' : ''} />
              {exporting === 'excel' ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

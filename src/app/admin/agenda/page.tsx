"use client";

import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiUser, FiPhone, FiMail, FiRefreshCw } from "react-icons/fi";
import { getAllAppointments, updateAppointmentStatus, type Appointment as AppointmentType } from "@/service/appointmentService";

// Mapeo de estados del backend a estados del frontend
const statusMapping = {
  "pendiente": "pending" as const,
  "confirmada": "confirmed" as const,
  "completada": "completed" as const,
  "cancelada": "cancelled" as const,
  "no_asistio": "cancelled" as const
};

type FrontendStatus = "confirmed" | "pending" | "completed" | "cancelled";

interface ProcessedAppointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  duration: number;
  phone?: string;
  email?: string;
  status: FrontendStatus;
  date: string;
  originalAppointment: AppointmentType;
}

export default function AdminAgenda() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<ProcessedAppointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const processAppointments = (rawAppointments: AppointmentType[]): ProcessedAppointment[] => {
    return rawAppointments.map(apt => ({
      id: apt.id,
      clientName: apt.client ? `${apt.client.firstName} ${apt.client.lastName}` : 'Cliente desconocido',
      service: apt.service?.name || 'Servicio desconocido',
      time: apt.startTime,
      duration: apt.service?.duration || 60,
      phone: apt.client?.phone,
      email: apt.client?.email,
      status: statusMapping[apt.status] || 'pending',
      date: apt.date,
      originalAppointment: apt
    }));
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAppointments();
      setAllAppointments(data);
      const processed = processAppointments(data);
      setAppointments(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentType['status']) => {
    try {
      setUpdatingStatus(appointmentId);
      await updateAppointmentStatus(appointmentId, newStatus);
      // Recargar las citas después de actualizar
      await loadAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar el estado');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: FrontendStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: FrontendStatus) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  // Filtrar citas por fecha seleccionada
  const filteredAppointments = appointments.filter(apt => apt.date === selectedDate);

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
            Agenda de Citas
          </h1>
          <p className="text-gray-300 text-lg">Gestiona las citas programadas para tu salón</p>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <FiCalendar className="text-pink-400 text-xl" />
            <label htmlFor="date" className="text-white font-medium">Seleccionar fecha:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400 flex items-center gap-2">
              <FiRefreshCw className="animate-spin" />
              Cargando citas...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-400">Error: {error}</p>
            <button 
              onClick={loadAppointments}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <FiRefreshCw /> Reintentar
            </button>
          </div>
        )}

        {/* Appointments Grid */}
        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-pink-500/50 transition-colors">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                  <span className="text-gray-400 text-sm">#{appointment.id}</span>
                </div>

                {/* Client Info */}
                <div className="mb-4">
                  <h3 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
                    <FiUser className="text-pink-400" />
                    {appointment.clientName}
                  </h3>
                  <p className="text-gray-300 font-medium">{appointment.service}</p>
                </div>

                {/* Time Info */}
                <div className="mb-4 flex items-center gap-2 text-gray-300">
                  <FiClock className="text-pink-400" />
                  <span>{appointment.time} ({appointment.duration} min)</span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  {appointment.phone && (
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <FiPhone className="text-pink-400" />
                      <span>{appointment.phone}</span>
                    </div>
                  )}
                  {appointment.email && (
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <FiMail className="text-pink-400" />
                      <span>{appointment.email}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                      Ver detalles
                    </button>
                    <button className="px-3 py-2 border border-slate-600 hover:border-slate-500 text-gray-300 rounded-lg text-sm transition-colors">
                      Editar
                    </button>
                  </div>
                  
                  {/* Status Update Buttons */}
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmada')}
                        disabled={updatingStatus === appointment.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {updatingStatus === appointment.id ? 'Actualizando...' : 'Confirmar'}
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelada')}
                        disabled={updatingStatus === appointment.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(appointment.id, 'completada')}
                        disabled={updatingStatus === appointment.id}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {updatingStatus === appointment.id ? 'Actualizando...' : 'Completar'}
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(appointment.id, 'no_asistio')}
                        disabled={updatingStatus === appointment.id}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        No asistió
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
            ) : (
              <div className="col-span-full">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
                  <FiCalendar className="mx-auto text-6xl text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No hay citas programadas</h3>
                  <p className="text-gray-500">No se encontraron citas para la fecha seleccionada.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && !error && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-2xl font-bold text-green-400">{filteredAppointments.filter(a => a.status === 'confirmed').length}</div>
              <div className="text-gray-400 text-sm">Confirmadas</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-2xl font-bold text-yellow-400">{filteredAppointments.filter(a => a.status === 'pending').length}</div>
              <div className="text-gray-400 text-sm">Pendientes</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-2xl font-bold text-blue-400">{filteredAppointments.filter(a => a.status === 'completed').length}</div>
              <div className="text-gray-400 text-sm">Completadas</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-2xl font-bold text-pink-400">{filteredAppointments.length}</div>
              <div className="text-gray-400 text-sm">Total hoy</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

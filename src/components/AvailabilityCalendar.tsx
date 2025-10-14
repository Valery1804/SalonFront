"use client";

import { useEffect, useMemo, useState } from "react";

interface AvailabilityCalendarProps {
  availableDates: string[];
  selectedDate: string;
  onSelect: (date: string) => void;
  loading?: boolean;
}

const PAGE_SIZE = 7;

function formatDateParts(dateString: string) {
  const parsed = new Date(dateString.length > 10 ? dateString : `${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return { weekday: dateString, day: "" };
  }

  return {
    weekday: parsed.toLocaleDateString("es-ES", { weekday: "short" }),
    day: parsed.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
  };
}

export default function AvailabilityCalendar({
  availableDates,
  selectedDate,
  onSelect,
  loading = false,
}: AvailabilityCalendarProps) {
  const sortedDates = useMemo(
    () =>
      [...new Set(availableDates)]
        .filter(Boolean)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    [availableDates],
  );

  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [sortedDates.length]);

  useEffect(() => {
    if (!selectedDate) return;
    const currentIndex = sortedDates.indexOf(selectedDate);
    if (currentIndex === -1) return;
    const desiredPage = Math.floor(currentIndex / PAGE_SIZE);
    if (desiredPage !== pageIndex) {
      setPageIndex(desiredPage);
    }
  }, [selectedDate, sortedDates, pageIndex]);

  const totalPages = Math.max(1, Math.ceil(sortedDates.length / PAGE_SIZE));
  const pageDates = sortedDates.slice(
    pageIndex * PAGE_SIZE,
    pageIndex * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-white">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-white/80">Selecciona una fecha disponible</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
            disabled={pageIndex === 0 || loading}
            className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() =>
              setPageIndex((value) => Math.min(totalPages - 1, value + 1))
            }
            disabled={pageIndex >= totalPages - 1 || loading}
            className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex flex-col items-center gap-4 py-6">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-pink-400" />
          <p className="text-xs text-gray-400">Consultando disponibilidad...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-gray-300">
          No hay fechas disponibles para este servicio. Intenta mas tarde o elige otro servicio.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {pageDates.map((date) => {
            const { weekday, day } = formatDateParts(date);
            const isSelected = selectedDate === date;
            return (
              <button
                key={date}
                type="button"
                onClick={() => onSelect(date)}
                className={`flex flex-col items-center justify-center rounded-2xl border px-3 py-4 text-sm transition ${
                  isSelected
                    ? "border-yellow-300 bg-yellow-300/10 text-white shadow-lg shadow-yellow-300/30"
                    : "border-white/10 text-gray-200 hover:border-yellow-300/60 hover:bg-white/5"
                }`}
              >
                <span className="uppercase tracking-wide text-xs text-gray-400">{weekday}</span>
                <span className="text-base font-semibold text-white">{day}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error" | "info";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface Toast extends Required<ToastOptions> {
  id: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const DEFAULT_DURATION = 4500;

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "info",
      duration = DEFAULT_DURATION,
    }: ToastOptions) => {
      const id = crypto.randomUUID();
      const nextToast: Toast = {
        id,
        title: title ?? getDefaultTitle(variant),
        description: description ?? "",
        variant,
        duration,
      };

      setToasts((prev) => [...prev, nextToast]);

      if (duration > 0) {
        timers.current[id] = setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast,
      clearToasts,
    }),
    [clearToasts, dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 top-4 z-[9997] flex flex-col items-center gap-3 px-4">
              {toasts.map((toast) => (
                <button
                  key={toast.id}
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-5 py-4 text-left shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 ${
                    variantStyles[toast.variant]
                  }`}
                >
                  <p className="text-sm font-semibold text-white">
                    {toast.title}
                  </p>
                  {toast.description ? (
                    <p className="mt-1 text-xs text-white/80">
                      {toast.description}
                    </p>
                  ) : null}
                  <span className="mt-3 block text-[0.65rem] uppercase tracking-wide text-white/60">
                    Tocar para cerrar
                  </span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const variantStyles: Record<ToastVariant, string> = {
  success:
    "border-emerald-400/40 bg-gradient-to-br from-emerald-500 via-emerald-500/90 to-slate-950/80",
  error:
    "border-red-400/40 bg-gradient-to-br from-red-500 via-red-500/90 to-slate-950/80",
  info: "border-cyan-400/40 bg-gradient-to-br from-cyan-500 via-cyan-500/90 to-slate-950/80",
};

function getDefaultTitle(variant: ToastVariant): string {
  switch (variant) {
    case "success":
      return "Acción completada";
    case "error":
      return "Ocurrió un error";
    default:
      return "Información";
  }
}

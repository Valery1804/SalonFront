"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998] bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div
          className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-[1px] shadow-2xl"
          onClick={handleContentClick}
        >
          <div className="relative rounded-[calc(1.5rem-1px)] bg-slate-950/95">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white text-xl transition hover:bg-white/20"
              aria-label="Cerrar modal"
            >
              x
            </button>
            <div className="p-6 pt-10">{children}</div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

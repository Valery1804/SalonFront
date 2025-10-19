"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { deleteUser } from "@/service/userService";
import { getErrorMessage } from "@/utils/error";
import { useToast } from "@/providers/ToastProvider";

interface DeleteButtonProps {
  userId: string;
  onDeleted?: () => void;
}

export default function DeleteUserButton({
  userId,
  onDeleted,
}: DeleteButtonProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const executeDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await deleteUser(userId);
      showToast({
        variant: "success",
        title: "Usuario eliminado",
        description: "El registro fue eliminado correctamente.",
      });
      setConfirmOpen(false);
      onDeleted?.();
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError, "No se pudo eliminar el usuario"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error ? (
        <p className="mb-2 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-200 transition hover:border-red-300 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Eliminando..." : "Eliminar usuario"}
      </button>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="space-y-4 text-white">
          <header>
            <h3 className="text-xl font-semibold">Confirmar eliminación</h3>
            <p className="mt-1 text-sm text-gray-300">
              Esta acción no se puede deshacer. ¿Deseas eliminar definitivamente
              este usuario?
            </p>
          </header>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void executeDelete()}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-red-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

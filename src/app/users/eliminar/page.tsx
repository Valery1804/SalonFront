"use client";

import { useState } from "react";
import { deleteUser } from "@/service/userService";

interface DeleteButtonProps {
  userId: string;
  onDeleted?: () => void; // callback opcional después de eliminar
}

export default function DeleteUserButton({ userId, onDeleted }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    setLoading(true);
    setError("");

    try {
      await deleteUser(userId);
      alert("Usuario eliminado exitosamente");
      if (onDeleted) onDeleted(); // actualizar lista si hay callback
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        {loading ? "Eliminando..." : "Eliminar Usuario"}
      </button>
    </div>
  );
}

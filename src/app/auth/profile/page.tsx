"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState("Cargando perfil...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token"); // 👈 Debes guardar el token aquí en el login

    if (!token) {
      setMessage("❌ No hay sesión activa. Inicia sesión para continuar.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          "https://salonback-production.up.railway.app/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setProfile(data);
          setMessage("");
        } else if (res.status === 401) {
          setMessage("⚠️ Sesión no autorizada o expirada. Inicia sesión nuevamente.");
        } else {
          setMessage("❌ Error al obtener el perfil del usuario.");
        }
      } catch (error) {
        console.error(error);
        setMessage("⚠️ Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Perfil del Usuario</h1>

        {loading ? (
          <p className="text-gray-300 animate-pulse">Cargando...</p>
        ) : profile ? (
          <div className="space-y-2 text-left">
            <p><strong>👤 Nombre:</strong> {profile.name}</p>
            <p><strong>📧 Email:</strong> {profile.email}</p>
            {profile.role && <p><strong>🧩 Rol:</strong> {profile.role}</p>}
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/auth/login";
              }}
              className="mt-6 w-full py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <p className="text-gray-300 text-center">{message}</p>
        )}
      </div>
    </main>
  );
}

"use client";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 text-white">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-pink-400" />
      <p className="text-sm text-gray-300">Cargando experiencia SalonClick...</p>
    </div>
  );
}

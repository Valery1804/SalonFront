"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrestadorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/prestador/mis-citas");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="space-y-3 text-center text-white">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-pink-400" />
        <p className="text-sm text-white/70">Redirigiendo a tus citas…</p>
      </div>
    </div>
  );
}

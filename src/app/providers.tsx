"use client";

import { AuthProvider } from "@/providers/AuthProvider";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}

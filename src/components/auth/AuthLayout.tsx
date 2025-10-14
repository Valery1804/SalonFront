"use client";

import type { ReactNode } from "react";

interface AuthLayoutProps {
  heroTitle: string;
  heroSubtitle?: string;
  heroDescription?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({
  heroTitle,
  heroSubtitle,
  heroDescription,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center">
        <header className="flex-1 space-y-6">
          <p className="text-xs uppercase tracking-[0.5em] text-pink-300">
            SalonClick
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            {heroTitle}
          </h1>
          {heroSubtitle ? (
            <p className="text-lg text-gray-200">{heroSubtitle}</p>
          ) : null}
          {heroDescription ? (
            <p className="max-w-lg text-sm text-gray-300">{heroDescription}</p>
          ) : null}
          <ul className="grid gap-3 text-sm text-gray-400 sm:grid-cols-2">
            {[
              "Reservas en tiempo real con recordatorios automaticos.",
              "Profesionales verificados y resenas transparentes.",
              "Panel de control para seguir tus citas y servicios.",
              "Soporte rapido cuando lo necesites.",
            ].map((feature) => (
              <li
                key={feature}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg shadow-pink-500/5"
              >
                {feature}
              </li>
            ))}
          </ul>
        </header>

        <div className="flex-1">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
            {children}
          </div>
          {footer ? <div className="mt-6 text-sm text-gray-300">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}

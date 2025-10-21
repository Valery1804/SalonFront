"use client";

import { useMemo } from "react";

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export default function PasswordRequirements({
  password,
  className = "",
}: PasswordRequirementsProps) {
  const requirements: PasswordRequirement[] = useMemo(
    () => [
      {
        label: "Mínimo 8 caracteres",
        regex: /.{8,}/,
        met: /.{8,}/.test(password),
      },
      {
        label: "Al menos una letra minúscula (a-z)",
        regex: /[a-z]/,
        met: /[a-z]/.test(password),
      },
      {
        label: "Al menos una letra mayúscula (A-Z)",
        regex: /[A-Z]/,
        met: /[A-Z]/.test(password),
      },
      {
        label: "Al menos un número (0-9)",
        regex: /\d/,
        met: /\d/.test(password),
      },
      {
        label: "Al menos un carácter especial (@$!%*?&)",
        regex: /[@$!%*?&]/,
        met: /[@$!%*?&]/.test(password),
      },
    ],
    [password]
  );

  const allRequirementsMet = useMemo(
    () => requirements.every((req) => req.met),
    [requirements]
  );

  return (
    <div
      className={`space-y-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full transition-colors ${
            allRequirementsMet ? "bg-emerald-400" : "bg-orange-400"
          }`}
        />
        <p className="text-xs font-medium uppercase tracking-wider text-white/70">
          Requisitos de contraseña
        </p>
      </div>

      <ul className="space-y-2">
        {requirements.map((requirement, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-xs transition-all ${
                requirement.met
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-white/30"
              }`}
            >
              {requirement.met ? "✓" : "○"}
            </span>
            <span
              className={`transition-colors ${
                requirement.met ? "text-emerald-300" : "text-white/50"
              }`}
            >
              {requirement.label}
            </span>
          </li>
        ))}
      </ul>

      {password && !allRequirementsMet && (
        <p className="text-xs text-orange-300/80">
          Completa todos los requisitos para continuar
        </p>
      )}
    </div>
  );
}

/**
 * Hook para validar si una contraseña cumple con todos los requisitos
 */
export function usePasswordValidation(password: string): {
  isValid: boolean;
  errors: string[];
} {
  return useMemo(() => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra minúscula");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra mayúscula");
    }
    if (!/\d/.test(password)) {
      errors.push("La contraseña debe contener al menos un número");
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push("La contraseña debe contener al menos un carácter especial (@$!%*?&)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [password]);
}

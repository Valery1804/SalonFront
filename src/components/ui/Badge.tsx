import { type ReactNode } from "react";

export interface BadgeProps {
  variant?: "success" | "error" | "warning" | "info" | "neutral";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = "neutral",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full border font-semibold uppercase tracking-wide";

  const variantStyles = {
    success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    error: "border-red-400/40 bg-red-500/10 text-red-200",
    warning: "border-orange-400/40 bg-orange-500/10 text-orange-200",
    info: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
    neutral: "border-white/10 bg-white/5 text-gray-200",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[0.65rem]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

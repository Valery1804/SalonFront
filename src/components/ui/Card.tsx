import { type ReactNode } from "react";

export interface CardProps {
  variant?: "default" | "elevated" | "interactive";
  padding?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  variant = "default",
  padding = "md",
  children,
  className = "",
  onClick,
}: CardProps) {
  const baseStyles = "rounded-3xl border border-white/10 shadow-xl";

  const variantStyles = {
    default: "bg-slate-900/60",
    elevated: "bg-white/5",
    interactive:
      "bg-slate-900/60 cursor-pointer transition hover:border-pink-400/50 hover:shadow-pink-500/20",
  };

  const paddingStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-xl font-semibold text-white ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-400 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mt-6 flex flex-wrap gap-3 ${className}`}>{children}</div>;
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeStyles[size]} animate-spin rounded-full border-4 border-white/10 border-t-pink-400`}
      />
    </div>
  );
}

export function LoadingPage({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="space-y-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-white/70">{message}</p>
      </div>
    </div>
  );
}

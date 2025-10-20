import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            {label}
            {props.required && <span className="ml-1 text-pink-400">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-pink-400/60 disabled:cursor-not-allowed disabled:opacity-60 ${
            error
              ? "border-red-400/60 bg-red-500/5"
              : "border-white/10"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-xs text-red-300">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-2 text-xs text-gray-400">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

import React, { type ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "dark" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 rounded-full gap-1.5",
    md: "text-xs sm:text-sm px-5 py-2.5 rounded-full gap-2",
    lg: "text-sm px-6 py-3 rounded-full gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-[#0B4FB8] text-white hover:bg-[#094199] active:bg-[#07337a] focus:ring-[#0B4FB8]/40 shadow-sm",
    dark:
      "bg-[#101828] text-white hover:bg-[#1d2939] active:bg-[#0c111d] focus:ring-[#101828]/40 shadow-sm",
    outline:
      "border border-[#D0D5DD] bg-white text-[#344054] hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-300",
    danger:
      "border border-[#FDA29B] bg-white text-[#D92D20] hover:bg-red-50 focus:ring-red-300",
    ghost:
      "text-[#667085] hover:text-[#101828] hover:bg-gray-100 focus:ring-gray-300",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
}

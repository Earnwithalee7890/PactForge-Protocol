import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  className?: string;
  pulse?: boolean;
}

export default function Badge({
  children,
  variant = "primary",
  className = "",
  pulse = false,
}: BadgeProps) {
  // Map pulse animation based on variant
  const pulseClass = pulse 
    ? (variant === "success" ? "pulse-green" : variant === "warning" ? "pulse-yellow" : variant === "danger" ? "pulse-red" : "pulse-blue")
    : "";

  return (
    <span className={`badge badge-${variant} ${pulseClass} ${className}`}>
      {children}
    </span>
  );
}

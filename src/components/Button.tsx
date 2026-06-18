import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  className?: string;
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner" />
          Loading...
        </>
      ) : children}
      <style jsx>{`
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.8s linear infinite;
          margin-right: 6px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

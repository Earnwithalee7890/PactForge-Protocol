"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextType = {
  toast: (message: string, type?: "success" | "error" | "info") => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: "fixed",
        top: 80,
        right: 24,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "none"
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === "success" ? "rgba(34,197,94,0.9)" : t.type === "error" ? "rgba(239,68,68,0.9)" : "rgba(99,102,241,0.9)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            fontSize: 14,
            fontWeight: 600,
            animation: "fadeInUp 0.3s ease forwards",
            backdropFilter: "blur(10px)"
          }}>
            {t.type === "success" ? "✅ " : t.type === "error" ? "❌ " : "ℹ️ "}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

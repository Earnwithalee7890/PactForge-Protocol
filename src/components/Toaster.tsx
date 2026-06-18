"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  action?: ToastAction;
};

type ToastContextType = {
  toast: (message: string, type?: "success" | "error" | "info" | "warning", action?: ToastAction) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: "success" | "error" | "info" | "warning" = "info", action?: ToastAction) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }, [dismiss]);

  const borderColors = {
    success: "rgba(34, 197, 94, 0.4)",
    error: "rgba(239, 68, 68, 0.4)",
    warning: "rgba(245, 158, 11, 0.4)",
    info: "rgba(99, 102, 241, 0.4)",
  };

  const glows = {
    success: "0 0 15px rgba(34, 197, 94, 0.15)",
    error: "0 0 15px rgba(239, 68, 68, 0.15)",
    warning: "0 0 15px rgba(245, 158, 11, 0.15)",
    info: "0 0 15px rgba(99, 102, 241, 0.15)",
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div style={{
        position: "fixed",
        top: 80,
        right: 24,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        maxWidth: 360,
        pointerEvents: "none"
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: "rgba(18, 19, 26, 0.85)",
            border: `1px solid ${borderColors[t.type]}`,
            color: "#f1f5f9",
            padding: "14px 18px",
            borderRadius: 12,
            boxShadow: glows[t.type],
            fontSize: 14,
            fontWeight: 500,
            animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            backdropFilter: "blur(12px)",
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            position: "relative"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingRight: 20 }}>
              <span style={{ fontSize: 16 }}>
                {t.type === "success" ? "✅" : t.type === "error" ? "❌" : t.type === "warning" ? "⚠️" : "ℹ️"}
              </span>
              <div style={{ flex: 1, wordBreak: "break-word", lineHeight: 1.4 }}>{t.message}</div>
            </div>
            
            {t.action && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                style={{
                  alignSelf: "flex-start",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#f1f5f9",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"}
              >
                {t.action.label}
              </button>
            )}

            <button 
              onClick={() => dismiss(t.id)}
              style={{
                position: "absolute",
                top: 10,
                right: 12,
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                fontSize: 14,
                padding: 4,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              aria-label="Dismiss toast"
            >
              ✕
            </button>
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


import React from "react";
import Button from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon = "📂",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="glass-card empty-state-container" style={{
      padding: "48px 32px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      width: "100%",
      maxWidth: 600,
      margin: "24px auto",
    }}>
      <div className="empty-state-icon" style={{
        fontSize: 48,
        lineHeight: 1,
        marginBottom: 8,
      }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 8px 0", maxWidth: 400, lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      <style jsx>{`
        .empty-state-container {
          animation: fadeInUp 0.5s ease-out;
        }
        .empty-state-icon {
          animation: float 4s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}

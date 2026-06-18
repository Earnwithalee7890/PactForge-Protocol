import React, { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${className}`}
      aria-label="Copy to clipboard"
      title="Copy to clipboard"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "4px",
        cursor: "pointer",
        padding: "4px 8px",
        color: copied ? "var(--success)" : "var(--text-secondary)",
        fontSize: "11px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        transition: "var(--transition)",
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.borderColor = "var(--border-accent)";
          e.currentTarget.style.color = "var(--text-primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }
      }}
    >
      <span>{copied ? "✓" : "📋"}</span>
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

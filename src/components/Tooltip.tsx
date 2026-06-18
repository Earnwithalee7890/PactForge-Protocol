import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      style={{ display: "inline-block", position: "relative" }}
    >
      {children}
      {visible && (
        <div className={`tooltip-box tooltip-${position}`}>
          {content}
        </div>
      )}
      <style jsx>{`
        .tooltip-box {
          position: absolute;
          background: rgba(18, 19, 26, 0.95);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          line-height: 1.4;
          white-space: normal;
          min-width: 160px;
          max-width: 240px;
          z-index: 1100;
          box-shadow: var(--glow-primary);
          backdrop-filter: blur(8px);
          pointer-events: none;
          text-align: center;
        }
        .tooltip-top {
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
        }
        .tooltip-bottom {
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(8px);
        }
        .tooltip-left {
          right: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(-8px);
        }
        .tooltip-right {
          left: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(8px);
        }
      `}</style>
    </div>
  );
}

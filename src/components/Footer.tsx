"use client";
import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{
      padding: "40px 24px", 
      borderTop: "1px solid rgba(255,255,255,0.06)",
      textAlign: "center", 
      color: "#64748b", 
      fontSize: 13,
      background: "rgba(10, 11, 15, 0.4)",
      backdropFilter: "blur(8px)",
      position: "relative",
      zIndex: 10,
      width: "100%",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <Image src="/logo.png" alt="PactForge" width={24} height={24} style={{ borderRadius: 6 }} />
          <span style={{ fontWeight: 700, color: "#f1f5f9" }}>Pact<span style={{ color: "#f97316" }}>Forge</span></span>
          <span>•</span>
          <span>Built on Stacks</span>
          <span>•</span>
          <span>Bitcoin L2</span>
        </div>

        {/* Social Media Links */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <a href="https://github.com/Earnwithalee7890" target="_blank" rel="noopener noreferrer" className="social-link">
            <span>🐙 GitHub</span>
          </a>
          <a href="https://x.com/aleeasghar78" target="_blank" rel="noopener noreferrer" className="social-link">
            <span>🐦 Twitter / X</span>
          </a>
          <a href="https://www.linkedin.com/in/aliasgharkhoso/" target="_blank" rel="noopener noreferrer" className="social-link">
            <span>💼 LinkedIn</span>
          </a>
          <a href="https://farcaster.xyz/aleekhoso" target="_blank" rel="noopener noreferrer" className="social-link">
            <span>🔮 Farcaster</span>
          </a>
        </div>

        <p style={{ margin: 0 }}>© 2026 PactForge Protocol. All rights reserved.</p>
      </div>
      <style jsx>{`
        .social-link {
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }
        .social-link:hover {
          color: #f97316;
          transform: translateY(-1px);
        }
      `}</style>
    </footer>
  );
}

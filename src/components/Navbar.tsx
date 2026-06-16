"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/context/WalletContext";
import { useTheme } from "@/context/ThemeContext";
import { shortenAddress } from "@/lib/stacks";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/create-pact", label: "Create Pact" },
  { href: "/disputes", label: "Disputes" },
  { href: "/reputation", label: "Reputation" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { address, connected, connecting, connect, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: "0 24px", height: 72,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(10,11,15,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{ position: "relative" }} className="logo-container">
          <Image
            src="/logo.png"
            alt="PactForge"
            width={36}
            height={36}
            style={{ 
              borderRadius: 10, 
              boxShadow: "0 4px 15px rgba(249,115,22,0.4)",
              transition: "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
            className="logo-img"
          />
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
          Pact<span style={{ color: "#f97316" }}>Forge</span>
        </span>
      </Link>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
      }} className="desktop-nav">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} style={{
            padding: "8px 16px", borderRadius: 8,
            fontSize: 14, fontWeight: 500, color: "#94a3b8",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f1f5f9"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
          >{link.label}</Link>
        ))}

        <button onClick={toggleTheme} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
          fontSize: 14, padding: "6px 12px", borderRadius: 8, color: "#f1f5f9", transition: "all 0.2s"
        }}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        {connected ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
            <div style={{
              padding: "8px 14px", borderRadius: 8,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              fontSize: 13, fontWeight: 600, color: "#22c55e",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              {shortenAddress(address || "")}
            </div>
            <button onClick={disconnect} style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", cursor: "pointer", fontWeight: 600,
            }}>
              Disconnect
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={connect}
            disabled={connecting}
            style={{ marginLeft: 8, padding: "8px 20px", fontSize: 13, opacity: connecting ? 0.7 : 1 }}
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>

      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)} style={{
        display: "none", background: "none", border: "none", color: "#f1f5f9",
        fontSize: 24, cursor: "pointer", padding: 8,
      }} className="mobile-toggle">
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 72, left: 0, right: 0, bottom: 0,
          background: "rgba(10,11,15,0.98)", backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column", padding: 24, gap: 8, zIndex: 999,
        }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              style={{ padding: "16px 20px", borderRadius: 12, fontSize: 16, fontWeight: 500,
                color: "#f1f5f9", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>{link.label}</Link>
          ))}
          {connected ? (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{
                padding: "14px 24px", borderRadius: 12, textAlign: "center",
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                fontSize: 14, fontWeight: 600, color: "#22c55e",
              }}>
                Connected: {shortenAddress(address || "")}
              </div>
              <button onClick={() => { disconnect(); setMobileOpen(false); }} style={{
                padding: "14px 24px", borderRadius: 12, fontSize: 14,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444", cursor: "pointer", fontWeight: 600,
              }}>
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={connect}
              disabled={connecting}
              style={{ marginTop: 8, padding: "14px 24px", opacity: connecting ? 0.7 : 1 }}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .logo-container {
          perspective: 1000px;
        }
        .logo-container:hover :global(.logo-img) {
          transform: rotateY(360deg) scale(1.1);
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

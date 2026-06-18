"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

// SVG Icons for Theme Selector
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// SVG Disconnect Icon
const DisconnectIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// CSS-Animated Hamburger Icon
const HamburgerIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 22, height: 22, transition: "transform 0.3s ease" }}>
    <line x1="3" y1="12" x2="21" y2="12" style={{ transition: "opacity 0.25s ease, transform 0.3s ease", transformOrigin: "center", transform: open ? "scaleX(0)" : "none", opacity: open ? 0 : 1 }} />
    <line x1="3" y1="6" x2="21" y2="6" style={{ transition: "transform 0.3s ease", transformOrigin: "center", transform: open ? "translateY(6px) rotate(45deg)" : "none" }} />
    <line x1="3" y1="18" x2="21" y2="18" style={{ transition: "transform 0.3s ease", transformOrigin: "center", transform: open ? "translateY(-6px) rotate(-45deg)" : "none" }} />
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { address, connected, connecting, connect, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed",
        top: scrolled ? 12 : 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 1200,
        height: scrolled ? 60 : 68,
        zIndex: 1000,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(10, 11, 15, 0.82)" : "rgba(10, 11, 15, 0.45)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: scrolled ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(255, 255, 255, 0.04)",
        borderRadius: 18,
        boxShadow: scrolled ? "0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.03)" : "none",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Logo and Brand */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }} className="logo-container">
            {/* Glow Back-layer */}
            <div style={{
              position: "absolute", top: -4, left: -4, right: -4, bottom: -4,
              borderRadius: 12, background: "rgba(249, 115, 22, 0.15)",
              filter: "blur(8px)", zIndex: -1
            }} />
            <Image
              src="/logo.png"
              alt="PactForge"
              width={34}
              height={34}
              style={{ 
                borderRadius: 9, 
                boxShadow: "0 4px 15px rgba(249,115,22,0.3)",
                transition: "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}
              className="logo-img"
            />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
            Pact<span style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Forge</span>
          </span>
        </Link>

        {/* Desktop Navigation links */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
        }} className="desktop-nav">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isActive ? "#f8fafc" : "#94a3b8",
                  background: isActive ? "rgba(255, 255, 255, 0.05)" : "transparent",
                  border: isActive ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid transparent",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#f8fafc";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Action Controls (Theme Toggle & Wallet) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="desktop-nav">
          <button 
            onClick={toggleTheme} 
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 10,
              color: "#94a3b8",
              transition: "all 0.25s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f8fafc";
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "rotate(15deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.transform = "none";
            }}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          {connected ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(34, 197, 94, 0.04)",
              border: "1px solid rgba(34, 197, 94, 0.15)",
              borderRadius: 12,
              padding: "2px 2px 2px 12px",
              height: 38,
              gap: 12
            }}>
              {/* Green Dot with ripple animation */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="ripple-dot" style={{
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block"
                }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", fontFamily: "var(--font-mono)" }}>
                  {shortenAddress(address || "")}
                </span>
              </div>
              
              {/* Divider */}
              <div style={{ width: 1, height: 20, background: "rgba(34, 197, 94, 0.2)" }} />

              {/* Logout/Disconnect Button */}
              <button 
                onClick={disconnect}
                title="Disconnect Wallet"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "0 10px",
                  height: "100%",
                  borderRadius: "0 10px 10px 0",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ef4444";
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <DisconnectIcon />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={connect}
              disabled={connecting}
              style={{ 
                height: 38,
                padding: "0 18px", 
                fontSize: 13, 
                borderRadius: 11,
                opacity: connecting ? 0.7 : 1,
                boxShadow: "0 4px 15px rgba(99, 102, 241, 0.2)"
              }}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          style={{
            display: "none",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "#f1f5f9",
            cursor: "pointer",
            width: 38,
            height: 38,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            padding: 0
          }} 
          className="mobile-toggle"
        >
          <HamburgerIcon open={mobileOpen} />
        </button>
      </nav>

      {/* Floating Glassmorphic Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed",
          top: scrolled ? 80 : 96,
          left: 16,
          right: 16,
          background: "rgba(10, 11, 15, 0.94)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 2px rgba(255, 255, 255, 0.05)",
          display: "flex",
          flexDirection: "column",
          padding: 20,
          gap: 6,
          zIndex: 999,
          animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileOpen(false)}
                style={{ 
                  padding: "12px 16px", 
                  borderRadius: 10, 
                  fontSize: 15, 
                  fontWeight: 600,
                  color: isActive ? "#f97316" : "#f1f5f9",
                  background: isActive ? "rgba(249, 115, 22, 0.08)" : "rgba(255, 255, 255, 0.02)",
                  border: isActive ? "1px solid rgba(249, 115, 22, 0.15)" : "1px solid rgba(255, 255, 255, 0.04)",
                  transition: "all 0.2s"
                }}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, padding: "8px 4px" }}>
            <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Interface Theme</span>
            <button 
              onClick={toggleTheme} 
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: 10,
                color: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600
              }}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          <div style={{ height: 1, background: "rgba(255, 255, 255, 0.06)", margin: "8px 0" }} />

          {connected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{
                padding: "12px 16px", 
                borderRadius: 12, 
                textAlign: "center",
                background: "rgba(34,197,94,0.08)", 
                border: "1px solid rgba(34,197,94,0.2)",
                fontSize: 14, 
                fontWeight: 700, 
                color: "#22c55e",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.02em"
              }}>
                ● Connected: {shortenAddress(address || "")}
              </div>
              <button 
                onClick={() => { disconnect(); setMobileOpen(false); }} 
                className="btn btn-danger"
                style={{ 
                  borderRadius: 12, 
                  fontSize: 14, 
                  fontWeight: 700,
                  padding: "12px 0",
                  width: "100%"
                }}
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => { connect(); setMobileOpen(false); }}
              disabled={connecting}
              style={{ 
                borderRadius: 12,
                padding: "12px 0",
                fontSize: 14,
                width: "100%",
                opacity: connecting ? 0.7 : 1 
              }}
            >
              {connecting ? "Connecting Wallet..." : "Connect Wallet"}
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .logo-container {
          perspective: 1000px;
        }
        .logo-container:hover :global(.logo-img) {
          transform: rotateY(360deg) scale(1.08);
        }
        
        .nav-item {
          position: relative;
        }
        .nav-item::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 12px;
          height: 2px;
          border-radius: 4px;
          background: #f97316;
          transition: transform 0.25s ease;
        }
        .nav-item.active::after {
          transform: translateX(-50%) scaleX(1);
        }
        .nav-item:hover::after {
          transform: translateX(-50%) scaleX(0.7);
        }
        
        .ripple-dot {
          position: relative;
        }
        .ripple-dot::after {
          content: '';
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          border-radius: 50%;
          border: 1.5px solid #22c55e;
          animation: ripple 2s infinite cubic-bezier(0.25, 0, 0, 1);
        }
        
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}

"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LottieAnimation from "./LottieAnimation";

export default function MascotHelper() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("Hi! I'm Forge, your Pact assistant.");
  const pathname = usePathname();

  useEffect(() => {
    // Contextual hints based on route
    if (pathname === '/dashboard') {
      setMessage("Welcome to your Dashboard! Here you can quickly view all your active pacts and milestones. Try exporting your data to CSV!");
    } else if (pathname === '/create-pact') {
      setMessage("Creating a new Pact? Make sure your milestone amounts add up exactly to the total amount.");
    } else if (pathname === '/reputation') {
      setMessage("This is your Soul-Bound Reputation profile! Complete pacts to rank up and earn governance tokens.");
    } else if (pathname === '/disputes') {
      setMessage("Welcome to the DAO Arbitration hub. Stake tokens to become an arbiter and resolve disputes.");
    } else if (pathname?.startsWith('/pacts')) {
      setMessage("This is the Pact Detail view. You can flag obstacles if you are blocked, or submit deliverables when ready!");
    } else {
      setMessage("Hi! I'm Forge. Let me know if you need help navigating the protocol.");
    }

    // Auto-pop the helper on route change for 6 seconds if not explicitly closed recently
    setOpen(true);
    const timer = setTimeout(() => setOpen(false), 6000);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      pointerEvents: "none"
    }}>
      {/* Tooltip Dialog */}
      <div style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px 16px 0px 16px",
        padding: "18px 20px",
        width: 280,
        marginBottom: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.4), var(--glow-primary)",
        transform: open ? "scale(1) translateY(0)" : "scale(0.85) translateY(20px)",
        opacity: open ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: open ? "auto" : "none",
        transformOrigin: "bottom right",
        position: "relative"
      }}>
        {/* Tooltip Arrow */}
        <div style={{
          position: "absolute",
          bottom: -7,
          right: 24,
          width: 14,
          height: 14,
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-glass)",
          borderRight: "1px solid var(--border-glass)",
          transform: "rotate(45deg)",
          zIndex: 1
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Forge Helper</span>
          </div>
          <button 
            onClick={() => setOpen(false)}
            style={{ 
              background: "rgba(255,255,255,0.04)", 
              border: "1px solid rgba(255,255,255,0.08)", 
              color: "var(--text-muted)", 
              cursor: "pointer", 
              fontSize: 10,
              width: 20,
              height: 20,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            ✕
          </button>
        </div>
        
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
          {message}
        </p>
      </div>

      {/* Floating Mascot Button */}
      <div 
        onClick={() => setOpen(!open)}
        className="pulse-blue float-hover"
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "var(--accent-gradient)",
          boxShadow: "0 8px 30px rgba(99, 102, 241, 0.35)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          pointerEvents: "auto",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          border: "1px solid rgba(255,255,255,0.15)",
          transform: open ? "scale(0.9)" : "scale(1)"
        }}
      >
        <LottieAnimation src="https://assets10.lottiefiles.com/packages/lf20_myejio2g.json" style={{ width: 46, height: 46 }} />
      </div>
    </div>
  );
}

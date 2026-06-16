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

    // Auto-pop the helper on route change for 5 seconds if not explicitly closed recently
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
      pointerEvents: "none" // allow clicking through empty space
    }}>
      {/* Tooltip Dialog */}
      <div style={{
        background: "rgba(30, 41, 59, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        borderRadius: "16px 16px 0px 16px",
        padding: "16px 20px",
        width: 260,
        marginBottom: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.3), 0 0 20px rgba(99, 102, 241, 0.15)",
        transform: open ? "scale(1) translateY(0)" : "scale(0.8) translateY(20px)",
        opacity: open ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        pointerEvents: open ? "auto" : "none",
        transformOrigin: "bottom right"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#818cf8" }}>Forge Helper</span>
          <button 
            onClick={() => setOpen(false)}
            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.5, margin: 0 }}>
          {message}
        </p>
      </div>

      {/* Floating Mascot Button */}
      <div 
        onClick={() => setOpen(!open)}
        className="pulse-primary"
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #4f46e5, #6366f1)",
          boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          pointerEvents: "auto",
          transition: "transform 0.2s ease",
          border: "2px solid rgba(255,255,255,0.1)",
          transform: open ? "scale(0.9)" : "scale(1)"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = open ? "scale(0.9)" : "scale(1)"}
      >
        <LottieAnimation src="https://assets10.lottiefiles.com/packages/lf20_myejio2g.json" style={{ width: 44, height: 44 }} />
      </div>
    </div>
  );
}

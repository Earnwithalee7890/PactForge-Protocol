"use client";
import { useState, useEffect } from "react";
import LottieAnimation from "./LottieAnimation";

const SLIDES = [
  {
    title: "Hi there! I'm Forgey! 👋",
    text: "Your trustless escrow assistant. I'm here to explain how PactForge secures your agreements on Bitcoin L2!",
    badge: "Mascot Helper"
  },
  {
    title: "🔒 Smart Contract Escrow",
    text: "Clients deposit funds securely into Clarity smart contracts. Funds are locked safe and sound — no intermediaries, no rugs.",
    badge: "Escrow Logic"
  },
  {
    title: "📊 Milestone-Based Payments",
    text: "Projects are divided into milestones. Payment is automatically released only when you verify and approve deliverables.",
    badge: "Milestones"
  },
  {
    title: "⚖️ Decentralized Disputes",
    text: "If any conflict arises, staked arbiters review deliverables and vote on-chain to refund or release funds fairly.",
    badge: "Arbitration"
  },
  {
    title: "₿ Bitcoin Native Security",
    text: "All agreements are finalized on Stacks, inheriting the full security and decentralization of the core Bitcoin blockchain!",
    badge: "Bitcoin L2"
  }
];

export default function MascotHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Show a pulsing notification tip after 3 seconds to invite the user
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowNotification(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      {/* Speech Bubble */}
      {isOpen && (
        <div style={{
          width: 320,
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15)",
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          position: "relative",
        }}>
          {/* Close button */}
          <button 
            onClick={handleClose} 
            style={{
              position: "absolute", top: 12, right: 12,
              background: "none", border: "none", color: "#64748b",
              cursor: "pointer", fontSize: 16, fontWeight: 700
            }}
          >
            ✕
          </button>

          <div style={{ display: "inline-block", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#a5b4fc", marginBottom: 12 }}>
            {SLIDES[currentSlide].badge}
          </div>

          <h4 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>
            {SLIDES[currentSlide].title}
          </h4>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 18 }}>
            {SLIDES[currentSlide].text}
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              {currentSlide + 1} / {SLIDES.length}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {currentSlide > 0 && (
                <button 
                  onClick={handlePrev} 
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "#94a3b8", cursor: "pointer"
                  }}
                >
                  Back
                </button>
              )}
              <button 
                onClick={handleNext} 
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
                  borderRadius: 8, padding: "6px 16px", fontSize: 11, color: "white", fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.2)"
                }}
              >
                {currentSlide === SLIDES.length - 1 ? "Start Over" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Tooltip */}
      {showNotification && !isOpen && (
        <div style={{
          background: "rgba(99, 102, 241, 0.95)",
          color: "white",
          borderRadius: 12,
          padding: "10px 16px",
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 12,
          boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
          animation: "bounceFloat 2s ease-in-out infinite",
          pointerEvents: "none",
          position: "relative",
          whiteSpace: "nowrap"
        }}>
          💡 Psst! Click me to learn how PactForge works!
          <div style={{
            position: "absolute", bottom: -6, right: 36,
            width: 12, height: 12, background: "rgba(99, 102, 241, 0.95)",
            transform: "rotate(45deg)"
          }} />
        </div>
      )}

      {/* Floating Mascot Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 72, height: 72,
          borderRadius: "50%",
          background: isOpen ? "rgba(15, 23, 42, 0.9)" : "linear-gradient(135deg, #1e293b, #0f172a)",
          border: isOpen ? "2px solid #6366f1" : "2px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(99, 102, 241, 0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <LottieAnimation 
          src="https://assets10.lottiefiles.com/packages/lf20_myejio2g.json" 
          style={{ width: "64px", height: "64px" }}
        />
      </button>

      <style jsx global>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounceFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

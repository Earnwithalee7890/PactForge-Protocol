"use client";
import { useState, useEffect } from "react";

export default function MascotAvatar({ size = 150 }: { size?: number }) {
  const [expression, setExpression] = useState<"happy" | "waving" | "excited">("happy");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Automatically wave every 5 seconds to grab attention
    const interval = setInterval(() => {
      setExpression("waving");
      setTimeout(() => setExpression("happy"), 2000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setExpression("excited");
    setTimeout(() => setExpression("happy"), 1500);
  };

  return (
    <div 
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer",
        transition: "transform 0.3s ease",
        transform: hovered ? "scale(1.05)" : "scale(1)",
      }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Interactive 3D cartoon mascot explainer robot */}
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="neon">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Glow background */}
        <circle cx="100" cy="110" r="70" fill="url(#glow)" className="glow-pulse" />

        {/* Robot Head */}
        <g className="head-float">
          {/* Antennas */}
          <rect x="97" y="25" width="6" height="20" rx="3" fill="#64748b" />
          <circle cx="100" cy="22" r="8" fill="url(#orangeGrad)" filter="url(#neon)" className="antenna-glow" />

          {/* Ears */}
          <rect x="42" y="55" width="10" height="30" rx="5" fill="#475569" stroke="#334155" strokeWidth="1" />
          <rect x="148" y="55" width="10" height="30" rx="5" fill="#475569" stroke="#334155" strokeWidth="1" />

          {/* Head Body */}
          <rect x="48" y="40" width="104" height="60" rx="24" fill="url(#bodyGrad)" stroke="#475569" strokeWidth="3" />
          
          {/* Face Screen */}
          <rect x="58" y="48" width="84" height="44" rx="16" fill="#020617" stroke="#f97316" strokeWidth="2.5" filter="url(#neon)" />

          {/* Eyes */}
          {expression === "happy" && (
            <>
              {/* Happy/Smiling eyes */}
              <path d="M72 68 Q80 58 88 68" stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" fill="none" className="eye-blink" />
              <path d="M112 68 Q120 58 128 68" stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" fill="none" className="eye-blink" />
            </>
          )}

          {expression === "waving" && (
            <>
              {/* Curious/Winking eyes */}
              <path d="M72 68 Q80 58 88 68" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <circle cx="120" cy="65" r="7" fill="#fbbf24" filter="url(#neon)" />
            </>
          )}

          {expression === "excited" && (
            <>
              {/* Wide/Glow excited eyes */}
              <circle cx="80" cy="65" r="8" fill="#fbbf24" filter="url(#neon)" />
              <circle cx="120" cy="65" r="8" fill="#fbbf24" filter="url(#neon)" />
            </>
          )}

          {/* Mouth */}
          <path d="M92 80 Q100 86 108 80" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </g>

        {/* Neck */}
        <rect x="90" y="97" width="20" height="12" rx="4" fill="#334155" />

        {/* Robot Body */}
        <g className="body-float">
          <rect x="60" y="106" width="80" height="64" rx="18" fill="url(#bodyGrad)" stroke="#475569" strokeWidth="3" />

          {/* Glowing Orange Core */}
          <circle cx="100" cy="138" r="18" fill="url(#orangeGrad)" filter="url(#neon)" className="core-glow" />
          
          {/* Anvil icon inside core */}
          <path d="M93 135 H107 L103 145 H97 Z" fill="#ffffff" />
          
          {/* Outer mechanical rotation ring */}
          <circle cx="100" cy="138" r="22" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" className="ring-spin" />
        </g>

        {/* Left Arm */}
        <g className="left-arm">
          <path d="M60 118 Q38 124 30 102" stroke="#475569" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="30" cy="102" r="8" fill="url(#goldGrad)" stroke="#1e293b" strokeWidth="2" />
        </g>

        {/* Right Arm */}
        <g className={expression === "waving" ? "right-arm-wave" : "right-arm"}>
          {expression === "waving" ? (
            <path d="M140 118 Q165 110 172 82" stroke="#475569" strokeWidth="8" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M140 118 Q162 124 170 102" stroke="#475569" strokeWidth="8" strokeLinecap="round" fill="none" />
          )}
          <circle cx={expression === "waving" ? 172 : 170} cy={expression === "waving" ? 82 : 102} r="8" fill="url(#goldGrad)" stroke="#1e293b" strokeWidth="2" />
        </g>

        {/* Floating Shadow */}
        <ellipse cx="100" cy="182" rx="38" ry="6" fill="#020617" opacity="0.6" className="shadow-shrink" />
      </svg>

      <style jsx global>{`
        .head-float {
          animation: floatHead 3s ease-in-out infinite;
        }
        .body-float {
          animation: floatBody 3s ease-in-out infinite;
        }
        .glow-pulse {
          animation: glowPulse 3s ease-in-out infinite;
        }
        .antenna-glow {
          animation: blinkLight 0.8s infinite alternate;
        }
        .eye-blink {
          animation: blinkEyes 4.5s infinite;
        }
        .ring-spin {
          transform-origin: 100px 138px;
          animation: spinRing 4s linear infinite;
        }
        .right-arm-wave {
          transform-origin: 140px 118px;
          animation: waveArm 0.6s ease-in-out infinite alternate;
        }
        .shadow-shrink {
          animation: shrinkShadow 3s ease-in-out infinite;
        }
        @keyframes floatHead {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes floatBody {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes blinkLight {
          0% { filter: brightness(1); }
          100% { filter: brightness(1.6) drop-shadow(0 0 8px #f97316); }
        }
        @keyframes blinkEyes {
          0%, 93%, 100% { transform: scaleY(1); }
          96.5% { transform: scaleY(0.08); }
        }
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes waveArm {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-30deg); }
        }
        @keyframes shrinkShadow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(0.85); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}

"use client";

export default function ThreeDLogo({ size = 280 }: { size?: number }) {
  return (
    <div 
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
      className="coin-perspective"
    >
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="spinning-coin-logo">
        <defs>
          <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="metalOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="innerGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="neonFilter">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient background glow */}
        <circle cx="100" cy="100" r="90" fill="url(#shieldGlow)" />

        {/* Outer futuristic cog ring */}
        <circle cx="100" cy="100" r="85" fill="none" stroke="url(#metalOrange)" strokeWidth="6" filter="url(#neonFilter)" />
        <circle cx="100" cy="100" r="75" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="12 6" opacity="0.5" className="dash-rotate" />

        {/* Outer 3D thick border bevel */}
        <circle cx="100" cy="100" r="81" fill="none" stroke="url(#innerGold)" strokeWidth="3" opacity="0.8" />

        {/* Solid inner shield background */}
        <path d="M100 40 L155 62 V120 Q100 168 100 168 Q100 168 45 120 V62 Z" fill="url(#darkBg)" stroke="url(#innerGold)" strokeWidth="4.5" />

        {/* Glowing Orange Anvil/Forge Core */}
        <g className="inner-pulse">
          {/* Neon orange energy aura */}
          <path d="M78 85 H122 Q112 102 118 118 H82 Q88 102 78 85 Z" fill="url(#metalOrange)" filter="url(#neonFilter)" opacity="0.9" />
          {/* Gold anvil base */}
          <rect x="68" y="118" width="64" height="15" rx="5" fill="url(#innerGold)" stroke="#fbbf24" strokeWidth="1" />
          {/* Sparkles of creation */}
          <circle cx="100" cy="68" r="5" fill="#ffffff" filter="url(#neonFilter)" className="spark-blink" />
          <path d="M95 68 H105 M100 63 V73" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>

      <style jsx global>{`
        .coin-perspective {
          perspective: 1200px;
        }
        .spinning-coin-logo {
          animation: logoSpin3D 8s linear infinite;
          transform-style: preserve-3d;
        }
        .dash-rotate {
          transform-origin: 100px 100px;
          animation: rotateDash 15s linear infinite;
        }
        .inner-pulse {
          animation: pulseCore 2.5s ease-in-out infinite alternate;
        }
        .spark-blink {
          animation: blinkSpark 1s ease-in-out infinite alternate;
        }
        @keyframes logoSpin3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes rotateDash {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseCore {
          0% { opacity: 0.8; transform: scale(0.98); transform-origin: 100px 100px; }
          100% { opacity: 1; transform: scale(1.02); transform-origin: 100px 100px; }
        }
        @keyframes blinkSpark {
          0% { opacity: 0.4; }
          100% { opacity: 1; filter: brightness(1.5); }
        }
      `}</style>
    </div>
  );
}

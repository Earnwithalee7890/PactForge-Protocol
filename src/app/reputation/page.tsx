"use client";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";

const TIERS = [
  { name: "Unranked", min: 0, color: "#64748b", icon: "○" },
  { name: "Bronze", min: 1, color: "#cd7f32", icon: "🥉" },
  { name: "Silver", min: 20, color: "#c0c0c0", icon: "🥈" },
  { name: "Gold", min: 50, color: "#ffd700", icon: "🥇" },
  { name: "Diamond", min: 100, color: "#b9f2ff", icon: "💎" },
];

const LEADERBOARD = [
  { rank: 1, address: "SP2F...FBT", score: 120, tier: "Diamond" },
  { rank: 2, address: "SP3F...R2A", score: 85, tier: "Gold" },
  { rank: 3, address: "SP1Q...W8N", score: 42, tier: "Silver" },
  { rank: 4, address: "SP4R...T6P", score: 18, tier: "Bronze" },
  { rank: 5, address: "SP5N...V3Q", score: 0, tier: "Unranked" },
];

export default function ReputationPage() {
  const { 
    address, 
    connected, 
    reputation, 
    isReputationLoading, 
    initializeReputation, 
    mintPFG,
    pfgBalance,
    connect
  } = useWallet();

  const [mintAmount, setMintAmount] = useState<string>("1000");
  const [recipient, setRecipient] = useState<string>("");
  const [minting, setMinting] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(false);

  // Determine current tier from score
  const getTierInfo = (score: number) => {
    if (score >= 100) return { current: TIERS[4], next: null, progress: 100 };
    if (score >= 50) return { current: TIERS[3], next: TIERS[4], progress: ((score - 50) / 50) * 100 };
    if (score >= 20) return { current: TIERS[2], next: TIERS[3], progress: ((score - 20) / 30) * 100 };
    if (score >= 1) return { current: TIERS[1], next: TIERS[2], progress: ((score - 1) / 19) * 100 };
    return { current: TIERS[0], next: TIERS[1], progress: 0 };
  };

  const score = reputation?.score || 0;
  const { current: currentTier, next: nextTier, progress } = getTierInfo(score);

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      await initializeReputation();
    } finally {
      setInitializing(false);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;
    setMinting(true);
    try {
      await mintPFG(parseFloat(mintAmount), recipient);
    } finally {
      setMinting(false);
    }
  };

  const isOwner = address === "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT";

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container">
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>Reputation & Governance</h1>
        <p style={{ color: "#94a3b8", marginBottom: 40 }}>Soul-bound on-chain reputation tracking and token utilities on Stacks Mainnet.</p>

        {!connected ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Wallet Not Connected</h3>
            <p style={{ color: "#94a3b8", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
              Connect your Stacks wallet to view your mainnet reputation score and interact with the protocol.
            </p>
            <button className="btn btn-primary" onClick={connect}>Connect Wallet</button>
          </div>
        ) : isReputationLoading ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }} className="animate-pulse">🔄</div>
            <p style={{ color: "#94a3b8" }}>Loading live mainnet profile details...</p>
          </div>
        ) : !reputation ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", marginBottom: 32,
            background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(139,92,246,0.02))", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌱</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Profile Not Initialized</h3>
            <p style={{ color: "#94a3b8", marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>
              You don't have an active reputation profile on-chain. Initialize your soul-bound profile to start building trust.
            </p>
            <button className="btn btn-primary" onClick={handleInitialize} disabled={initializing}>
              {initializing ? "Sending Transaction..." : "⚡ Initialize On-Chain Profile"}
            </button>
          </div>
        ) : (
          <>
            {/* Live Profile Card */}
            <div className="glass-card" style={{ padding: 36, marginBottom: 32, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
              background: `linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))`, border: "1px solid rgba(99,102,241,0.12)" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20, fontSize: 36,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 30px rgba(99,102,241,0.25)",
              }}>{currentTier.icon}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>
                  Connected: {address}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                  <span style={{ color: currentTier.color }}>{currentTier.name} Tier</span>
                  <span style={{ color: "#64748b", fontSize: 16, marginLeft: 12 }}>{score} pts</span>
                </div>
                {nextTier && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                      <span>{currentTier.name}</span>
                      <span>Next: {nextTier.name} ({nextTier.min} pts)</span>
                    </div>
                    <div style={{ width: "100%", maxWidth: 300, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
                      <div style={{ width: `${progress}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`, transition: "width 1s ease" }} />
                    </div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Governance Balance</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#6366f1" }}>{pfgBalance.toLocaleString()} PFG</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
              {/* On-Chain Metrics */}
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>On-Chain Metrics</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Pacts Completed", value: reputation.pactsCompleted, icon: "📋" },
                    { label: "Milestones Delivered", value: reputation.milestonesDelivered, icon: "📦" },
                    { label: "Disputes Won", value: reputation.disputesWon, icon: "🏆" },
                    { label: "Disputes Lost", value: reputation.disputesLost, icon: "❌" },
                  ].map((s, i) => (
                    <div key={i} className="glass-card" style={{ padding: 20, textAlign: "center" }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                      <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SBT Info */}
              <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🛡️ Soul-Bound Security</h3>
                <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                  PactForge reputation profiles use non-transferable Soul-Bound Tokens. Your performance history is permanently linked to your principal address, preventing identity buying and guaranteeing trust.
                </p>
                <div style={{ fontSize: 12, color: "#64748b", fontFamily: "var(--font-mono)" }}>
                  Joined at Block Height: #{reputation.joinedAt}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Admin PFG Token Minter (Only Contract Owner) */}
        {connected && isOwner && (
          <div className="glass-card" style={{ padding: 32, marginBottom: 40, border: "1px solid #6366f1" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#6366f1", marginBottom: 6 }}>👑 Admin Token Minter</h2>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>You are connected as the contract owner. Mint PFG governance tokens directly to any address on Mainnet.</p>
            <form onSubmit={handleMint} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Amount (PFG)</label>
                  <input className="input-field" type="number" value={mintAmount} onChange={e => setMintAmount(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Recipient Address</label>
                  <input className="input-field" placeholder="SP2..." value={recipient} onChange={e => setRecipient(e.target.value)} required style={{ fontFamily: "var(--font-mono)" }} />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={minting} style={{ alignSelf: "flex-end", padding: "12px 32px" }}>
                {minting ? "Minting..." : "⚡ Mint Governance Tokens"}
              </button>
            </form>
          </div>
        )}

        {/* Leaderboard */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏅 On-Chain Leaderboard</h2>
          <div className="glass-card" style={{ padding: 4, overflow: "hidden" }}>
            {LEADERBOARD.map((l, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
                borderBottom: i < LEADERBOARD.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: address && l.address.slice(0, 6) === address.slice(0, 6) ? "rgba(99,102,241,0.06)" : "transparent",
              }}>
                <div style={{ width: 32, textAlign: "center", fontWeight: 800, color: i < 3 ? "#ffd700" : "#64748b", fontSize: 16 }}>#{l.rank}</div>
                <div style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 14 }}>{l.address}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{l.score} pts</div>
                <div className="badge badge-primary" style={{ fontSize: 11 }}>{l.tier}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

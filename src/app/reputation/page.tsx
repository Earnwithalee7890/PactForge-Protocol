"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import LottieAnimation from "@/components/LottieAnimation";
import { pactStore } from "@/lib/pactStore";
import { ReputationProfile } from "@/lib/types";

const TIERS = [
  { 
    name: "Unranked", 
    min: 0, 
    color: "#64748b", 
    icon: "○", 
    animation: "https://assets10.lottiefiles.com/packages/lf20_myejio2g.json" // 3D cartoon avatar waving robot
  },
  { 
    name: "Bronze", 
    min: 1, 
    color: "#cd7f32", 
    icon: "🥉", 
    animation: "https://assets3.lottiefiles.com/packages/lf20_wd1upgpx.json" // 3D cartoon medal
  },
  { 
    name: "Silver", 
    min: 20, 
    color: "#c0c0c0", 
    icon: "🥈", 
    animation: "https://assets9.lottiefiles.com/packages/lf20_7n0a1h3q.json" // 3D cartoon rotating coin
  },
  { 
    name: "Gold", 
    min: 50, 
    color: "#ffd700", 
    icon: "🥇", 
    animation: "https://assets10.lottiefiles.com/packages/lf20_touoh4ky.json" // 3D cartoon gold trophy
  },
  { 
    name: "Diamond", 
    min: 100, 
    color: "#b9f2ff", 
    icon: "💎", 
    animation: "https://assets8.lottiefiles.com/packages/lf20_9n25qc.json" // 3D cartoon rotating diamond
  },
];

// Determine current tier from score
const getTierInfo = (score: number) => {
  if (score >= 100) return { current: TIERS[4], next: null, progress: 100 };
  if (score >= 50) return { current: TIERS[3], next: TIERS[4], progress: ((score - 50) / 50) * 100 };
  if (score >= 20) return { current: TIERS[2], next: TIERS[3], progress: ((score - 20) / 30) * 100 };
  if (score >= 1) return { current: TIERS[1], next: TIERS[2], progress: ((score - 1) / 19) * 100 };
  return { current: TIERS[0], next: TIERS[1], progress: 0 };
};

export default function ReputationPage() {
  const { 
    address, 
    connected, 
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
  
  const [localReputation, setLocalReputation] = useState<ReputationProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number, address: string, score: number, tier: string }>>([]);
  const [activities, setActivities] = useState<Array<{ date: string; title: string; desc: string; type: string }>>([]);

  useEffect(() => {
    if (address) {
      setLocalReputation(pactStore.getReputation(address));
      setActivities(pactStore.getActivityTimeline(address));
    } else {
      setLocalReputation(null);
      setActivities([]);
    }
    
    const allReps = pactStore.getAllReputations();
    const sorted = allReps.sort((a, b) => b.score - a.score);
    const generatedLeaderboard = sorted.map((r, i) => {
      const tierInfo = getTierInfo(r.score);
      return {
        rank: i + 1,
        address: r.address,
        score: r.score,
        tier: tierInfo.current.name
      };
    });
    setLeaderboard(generatedLeaderboard);
  }, [address]);

  const score = localReputation?.score || 0;
  const { current: currentTier, next: nextTier, progress } = getTierInfo(score);

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      await initializeReputation();
      if (address) {
        setLocalReputation(pactStore.getReputation(address));
      }
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
        <p style={{ color: "#94a3b8", marginBottom: 40 }}>Soul-bound on-chain reputation tracking and token utilities (Simulated).</p>

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
            <p style={{ color: "#94a3b8" }}>Loading live profile details...</p>
          </div>
        ) : !localReputation ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", marginBottom: 32,
            background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(139,92,246,0.02))", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>
              <LottieAnimation 
                src="https://assets10.lottiefiles.com/packages/lf20_myejio2g.json" 
                style={{ width: "120px", height: "120px", margin: "0 auto" }}
              />
            </div>
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
            {/* Live Profile Card with 3D Cartoon Avatar */}
            <div className="glass-card" style={{ padding: 36, marginBottom: 32, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
              background: `linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))`, border: "1px solid rgba(99,102,241,0.12)" }}>
              <div style={{
                width: 96, height: 96, borderRadius: 24,
                background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 30px rgba(99,102,241,0.15)",
                overflow: "hidden"
              }}>
                <LottieAnimation src={currentTier.animation} style={{ width: "80px", height: "80px" }} />
              </div>
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
              {/* Simulated Metrics */}
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Simulated Profile Metrics</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Pacts Completed", value: localReputation.completedPacts, icon: "📋" },
                    { label: "Disputed Pacts", value: localReputation.disputedPacts, icon: "❌" },
                    { label: "Total Earned", value: localReputation.totalEarned, icon: "💰" },
                    { label: "Profile Score", value: localReputation.score, icon: "⭐" },
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
                  Joined at Block Height: #{(812000 + Math.floor(Math.random() * 1000))}
                </div>
              </div>
            </div>

            {/* Activities Timeline */}
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📅 Activities Timeline</h2>
              <div className="glass-card" style={{ padding: 24 }}>
                {activities.length === 0 ? (
                  <div style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No activity recorded yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {activities.map((act, i) => (
                      <div key={i} style={{ display: "flex", gap: 16, position: "relative" }}>
                        {i !== activities.length - 1 && (
                          <div style={{ position: "absolute", left: 19, top: 40, bottom: -20, width: 2, background: "rgba(255,255,255,0.05)" }} />
                        )}
                        <div style={{ 
                          width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          background: act.type === 'success' ? "rgba(34,197,94,0.15)" : act.type === 'warning' ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
                          color: act.type === 'success' ? "#22c55e" : act.type === 'warning' ? "#f59e0b" : "#6366f1",
                          fontSize: 18
                        }}>
                          {act.type === 'success' ? '🏆' : act.type === 'warning' ? '⚖️' : '📝'}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{act.title}</div>
                          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>{act.desc}</div>
                          <div style={{ fontSize: 12, color: "#64748b", fontFamily: "var(--font-mono)" }}>{new Date(act.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏅 Dynamic Leaderboard</h2>
          <div className="glass-card" style={{ padding: 4, overflow: "hidden" }}>
            {leaderboard.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>No ranked users yet.</div>
            ) : leaderboard.map((l, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
                borderBottom: i < leaderboard.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
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

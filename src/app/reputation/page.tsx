"use client";

const TIERS = [
  { name: "Unranked", min: 0, color: "#64748b", icon: "○" },
  { name: "Bronze", min: 1, color: "#cd7f32", icon: "🥉" },
  { name: "Silver", min: 20, color: "#c0c0c0", icon: "🥈" },
  { name: "Gold", min: 50, color: "#ffd700", icon: "🥇" },
  { name: "Diamond", min: 100, color: "#b9f2ff", icon: "💎" },
];

const MOCK_USER = {
  address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  score: 87, tier: 3, pactsCompleted: 12, milestonesDelivered: 38,
  disputesWon: 3, disputesLost: 1, joinedBlock: 142500,
};

const MOCK_HISTORY = [
  { action: "Pact Completed", points: "+10", date: "May 18, 2026", icon: "✅" },
  { action: "Milestone Delivered", points: "+5", date: "May 17, 2026", icon: "📦" },
  { action: "Milestone Delivered", points: "+5", date: "May 15, 2026", icon: "📦" },
  { action: "Dispute Won", points: "+3", date: "May 12, 2026", icon: "⚖️" },
  { action: "Pact Completed", points: "+10", date: "May 10, 2026", icon: "✅" },
  { action: "Dispute Lost", points: "-5", date: "May 8, 2026", icon: "❌" },
];

const LEADERBOARD = [
  { rank: 1, address: "SP3F...R2A", score: 156, tier: "Diamond" },
  { rank: 2, address: "SP1Q...W8N", score: 134, tier: "Diamond" },
  { rank: 3, address: "SP4R...T6P", score: 98, tier: "Gold" },
  { rank: 4, address: "SP2J...K4M", score: 87, tier: "Gold" },
  { rank: 5, address: "SP5N...V3Q", score: 72, tier: "Gold" },
];

export default function ReputationPage() {
  const currentTier = TIERS[MOCK_USER.tier];
  const nextTier = TIERS[MOCK_USER.tier + 1];
  const progress = nextTier ? ((MOCK_USER.score - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container">
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>Reputation</h1>
        <p style={{ color: "#94a3b8", marginBottom: 40 }}>Soul-bound on-chain reputation tracking your reliability.</p>

        {/* Profile Card */}
        <div className="glass-card" style={{ padding: 36, marginBottom: 32, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
          background: `linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))`, border: "1px solid rgba(99,102,241,0.12)" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, fontSize: 36,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 30px rgba(99,102,241,0.25)",
          }}>{currentTier.icon}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#94a3b8", marginBottom: 4 }}>{MOCK_USER.address.slice(0, 8)}...{MOCK_USER.address.slice(-6)}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              <span style={{ color: currentTier.color }}>{currentTier.name}</span>
              <span style={{ color: "#64748b", fontSize: 16, marginLeft: 12 }}>{MOCK_USER.score} pts</span>
            </div>
            {nextTier && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                  <span>{currentTier.name}</span>
                  <span>{nextTier.name} ({nextTier.min} pts)</span>
                </div>
                <div style={{ width: "100%", maxWidth: 300, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ width: `${progress}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`, transition: "width 1s ease" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Stats */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Performance</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Pacts Completed", value: MOCK_USER.pactsCompleted, icon: "📋" },
                { label: "Milestones Done", value: MOCK_USER.milestonesDelivered, icon: "📦" },
                { label: "Disputes Won", value: MOCK_USER.disputesWon, icon: "🏆" },
                { label: "Disputes Lost", value: MOCK_USER.disputesLost, icon: "❌" },
              ].map((s, i) => (
                <div key={i} className="glass-card" style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Activity</h2>
            <div className="glass-card" style={{ padding: 4 }}>
              {MOCK_HISTORY.map((h, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  borderBottom: i < MOCK_HISTORY.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <span style={{ fontSize: 18 }}>{h.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{h.action}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{h.date}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: h.points.startsWith("+") ? "#22c55e" : "#ef4444" }}>{h.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏅 Leaderboard</h2>
          <div className="glass-card" style={{ padding: 4, overflow: "hidden" }}>
            {LEADERBOARD.map((l, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
                borderBottom: i < LEADERBOARD.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: l.address === "SP2J...K4M" ? "rgba(99,102,241,0.06)" : "transparent",
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

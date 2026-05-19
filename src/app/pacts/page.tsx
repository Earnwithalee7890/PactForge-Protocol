"use client";

const MOCK_PACT = {
  id: 1, title: "DeFi Dashboard UI/UX Design", client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  provider: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", totalAmount: "5,000 STX",
  fundedAmount: "5,000 STX", releasedAmount: "2,500 STX", state: 2, deadline: "Jun 15, 2026",
  createdAt: "May 1, 2026", description: "Complete redesign of the DeFi analytics dashboard with modern UI components.",
};

const MILESTONES = [
  { id: 1, title: "Wireframes & Mockups", amount: "1,000 STX", state: 5, desc: "Design wireframes for all pages" },
  { id: 2, title: "Frontend Components", amount: "1,500 STX", state: 5, desc: "Build React component library" },
  { id: 3, title: "Integration & Testing", amount: "1,500 STX", state: 1, desc: "Connect to smart contracts and test" },
  { id: 4, title: "Launch & Deployment", amount: "1,000 STX", state: 0, desc: "Deploy to production" },
];

const msColors: Record<number, { bg: string; color: string; label: string }> = {
  0: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8", label: "Pending" },
  1: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", label: "In Progress" },
  2: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "Submitted" },
  3: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Approved" },
  4: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", label: "Rejected" },
  5: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6", label: "Paid" },
};

export default function PactDetailPage() {
  const completedMs = MILESTONES.filter(m => m.state >= 3).length;
  const progress = (completedMs / MILESTONES.length) * 100;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>Pact #{MOCK_PACT.id}</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{MOCK_PACT.title}</h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>{MOCK_PACT.description}</p>
        </div>

        {/* Info Grid */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20 }}>
            {[
              { label: "Total Value", value: MOCK_PACT.totalAmount },
              { label: "Released", value: MOCK_PACT.releasedAmount },
              { label: "State", value: "Active" },
              { label: "Deadline", value: MOCK_PACT.deadline },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
              <span>Progress</span>
              <span>{completedMs}/{MILESTONES.length} milestones</span>
            </div>
            <div style={{ width: "100%", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
              <div style={{ width: `${progress}%`, height: "100%", borderRadius: 4,
                background: "linear-gradient(90deg, #6366f1, #8b5cf6)", transition: "width 0.8s ease" }} />
            </div>
          </div>
        </div>

        {/* Participants */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Client", addr: MOCK_PACT.client, icon: "👤" },
            { label: "Provider", addr: MOCK_PACT.provider, icon: "🛠️" },
          ].map((p, i) => (
            <div key={i} className="glass-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24 }}>{p.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{p.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#f1f5f9" }}>
                  {p.addr.slice(0, 8)}...{p.addr.slice(-6)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Milestones Timeline */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Milestones</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MILESTONES.map((ms, i) => {
            const st = msColors[ms.state];
            return (
              <div key={ms.id} className="glass-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: st.bg, color: st.color, fontWeight: 800, fontSize: 14,
                  border: `1px solid ${st.color}33`,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{ms.title}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{ms.desc}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, minWidth: 80, textAlign: "right" }}>{ms.amount}</div>
                <div style={{ padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <button className="btn btn-primary">⚡ Release Payment</button>
          <button className="btn btn-danger">🚨 Raise Dispute</button>
          <button className="btn btn-secondary">❌ Cancel Pact</button>
        </div>
      </div>
    </div>
  );
}

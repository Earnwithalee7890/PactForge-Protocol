"use client";
import { useState } from "react";

const MOCK_DISPUTES = [
  { id: 1, pactTitle: "Token Bridge Integration", raisedBy: "SP2J...K4M", reason: "Deliverables don't match spec requirements", votesClient: 2, votesProvider: 1, total: 3, state: "resolved-client", created: "May 12, 2026" },
  { id: 2, pactTitle: "NFT Art Generator", raisedBy: "SP3F...R2A", reason: "Provider missed deadline by 2 weeks", votesClient: 1, votesProvider: 0, total: 1, state: "voting", created: "May 16, 2026" },
  { id: 3, pactTitle: "DAO Governance Module", raisedBy: "SP1Q...W8N", reason: "Scope creep not reflected in payment terms", votesClient: 0, votesProvider: 0, total: 0, state: "open", created: "May 18, 2026" },
];

const stateStyle: Record<string, { bg: string; color: string; label: string }> = {
  open: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "Open" },
  voting: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", label: "Voting" },
  "resolved-client": { bg: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Resolved" },
};

export default function DisputesPage() {
  const [isArbiter, setIsArbiter] = useState(false);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800 }}>Disputes</h1>
            <p style={{ color: "#94a3b8", marginTop: 6 }}>Decentralized arbitration powered by community arbiters.</p>
          </div>
          {!isArbiter && (
            <button className="btn btn-primary" onClick={() => setIsArbiter(true)}>
              ⚖️ Become an Arbiter
            </button>
          )}
        </div>

        {/* Arbiter Status */}
        {isArbiter && (
          <div className="glass-card" style={{ padding: 24, marginBottom: 32, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
            background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚖️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#22c55e", marginBottom: 2 }}>Active Arbiter</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Staked 1 STX • 0 disputes resolved • Ready to vote</div>
            </div>
            <div className="badge badge-success">Active</div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { icon: "📊", label: "Total Disputes", value: "24" },
            { icon: "⚖️", label: "Active Arbiters", value: "18" },
            { icon: "✅", label: "Resolution Rate", value: "94%" },
            { icon: "⏱️", label: "Avg Resolution", value: "3.2 days" },
          ].map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Disputes List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MOCK_DISPUTES.map(d => {
            const st = stateStyle[d.state] || stateStyle.open;
            return (
              <div key={d.id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{d.pactTitle}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>Raised by {d.raisedBy} • {d.created}</div>
                  </div>
                  <div style={{ padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>"{d.reason}"</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: "#64748b" }}>Client: </span>
                      <span style={{ fontWeight: 600, color: "#3b82f6" }}>{d.votesClient}</span>
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: "#64748b" }}>Provider: </span>
                      <span style={{ fontWeight: 600, color: "#f59e0b" }}>{d.votesProvider}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{d.total}/3 votes</div>
                  </div>
                  {d.state !== "resolved-client" && isArbiter && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-success" style={{ padding: "6px 16px", fontSize: 12 }}>Vote Client</button>
                      <button className="btn btn-danger" style={{ padding: "6px 16px", fontSize: 12 }}>Vote Provider</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

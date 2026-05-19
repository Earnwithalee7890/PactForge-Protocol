"use client";
import { useState } from "react";

const MOCK_PACTS = [
  { id: 1, title: "DeFi Dashboard UI/UX", provider: "SP2J...K4M", amount: "5,000 STX", milestones: 4, completed: 2, state: "active", deadline: "Jun 15, 2026" },
  { id: 2, title: "Smart Contract Audit", provider: "SP3F...R2A", amount: "3,200 STX", milestones: 3, completed: 3, state: "completed", deadline: "May 28, 2026" },
  { id: 3, title: "NFT Marketplace Backend", provider: "SP1Q...W8N", amount: "8,500 STX", milestones: 5, completed: 0, state: "funded", deadline: "Jul 01, 2026" },
  { id: 4, title: "Token Bridge Integration", provider: "SP4R...T6P", amount: "12,000 STX", milestones: 6, completed: 1, state: "disputed", deadline: "Jun 20, 2026" },
];

const stateColors: Record<string, { bg: string; color: string }> = {
  active: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  completed: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  funded: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  disputed: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
};

export default function DashboardPage() {
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");
  const filtered = tab === "all" ? MOCK_PACTS : MOCK_PACTS.filter(p => p.state === tab);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>Dashboard</h1>
          <p style={{ color: "#94a3b8", marginTop: 6 }}>Manage your pacts, track milestones, and monitor earnings.</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Active Pacts", value: "3", icon: "📋" },
            { label: "Total Earned", value: "12,400 STX", icon: "💰" },
            { label: "Reputation Score", value: "87", icon: "⭐" },
            { label: "Completion Rate", value: "96%", icon: "✅" },
          ].map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, fontSize: 22,
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{s.label}</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {(["all", "active", "completed"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={tab === t ? "btn btn-primary" : "btn btn-secondary"}
              style={{ padding: "8px 20px", fontSize: 13, textTransform: "capitalize" }}>
              {t === "all" ? "All Pacts" : t}
            </button>
          ))}
        </div>

        {/* Pacts List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(p => (
            <div key={p.id} className="glass-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", fontFamily: "var(--font-mono)" }}>Provider: {p.provider}</div>
              </div>
              <div style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{p.amount}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Value</div>
              </div>
              <div style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.completed}/{p.milestones}</div>
                <div style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 6 }}>
                  <div style={{ width: `${(p.completed / p.milestones) * 100}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", transition: "width 0.5s ease" }} />
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Milestones</div>
              </div>
              <div style={{ textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: 12, color: "#64748b" }}>{p.deadline}</div>
              </div>
              <div style={{
                padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                background: stateColors[p.state]?.bg, color: stateColors[p.state]?.color,
                textTransform: "capitalize",
              }}>{p.state}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

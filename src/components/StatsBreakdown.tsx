"use client";
import React, { useMemo } from "react";
import { Pact } from "@/lib/types";

interface StatsBreakdownProps {
  pacts: Pact[];
}

export default function StatsBreakdown({ pacts }: StatsBreakdownProps) {
  const stats = useMemo(() => {
    let totalLocked = 0;
    let released = 0;
    let disputedCount = 0;
    let totalMilestones = 0;
    let completedMilestones = 0;

    pacts.forEach((p) => {
      const totalAmountVal = parseFloat((p.totalAmount || "0").replace(/[^0-9.]/g, "")) || 0;
      const releasedAmountVal = parseFloat((p.releasedAmount || "0").replace(/[^0-9.]/g, "")) || 0;
      
      if (p.state !== "draft") {
        totalLocked += (totalAmountVal - releasedAmountVal);
        released += releasedAmountVal;
      }
      if (p.state === "disputed") {
        disputedCount += 1;
      }

      (p.milestones || []).forEach((m) => {
        totalMilestones += 1;
        if (m.state === 5 || m.state === 3) {
          completedMilestones += 1;
        }
      });
    });

    const milestoneRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 100;
    const activePacts = pacts.filter(p => p.state === "active" || p.state === "funded").length;

    return {
      totalLocked,
      released,
      disputedCount,
      totalMilestones,
      completedMilestones,
      milestoneRate,
      activePacts
    };
  }, [pacts]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
      <div className="glass-card" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Locked Value</span>
          <span style={{ fontSize: 20 }}>🔒</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
          {stats.totalLocked.toLocaleString()} STX
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          Escrowed in active contracts
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Total Released</span>
          <span style={{ fontSize: 20 }}>💸</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--success)" }}>
          {stats.released.toLocaleString()} STX
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          Paid to developers
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Milestone Completion</span>
          <span style={{ fontSize: 20 }}>🚀</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-primary)", display: "flex", alignItems: "baseline", gap: 6 }}>
          {stats.milestoneRate}%
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>({stats.completedMilestones}/{stats.totalMilestones})</span>
        </div>
        <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)", marginTop: 8 }}>
          <div style={{ width: `${stats.milestoneRate}%`, height: "100%", borderRadius: 2, background: "var(--accent-gradient)" }} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Escrow Health</span>
          <span style={{ fontSize: 20 }}>🛡️</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: stats.disputedCount > 0 ? "var(--warning)" : "var(--success)" }}>
          {stats.disputedCount > 0 ? `${stats.disputedCount} Disputed` : "100% Healthy"}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          {stats.activePacts} active contracts monitored
        </div>
      </div>
    </div>
  );
}

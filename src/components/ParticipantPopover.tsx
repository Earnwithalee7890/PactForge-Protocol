"use client";
import React, { useMemo } from "react";
import { pactStore } from "@/lib/pactStore";
import Badge from "@/components/Badge";

interface ParticipantPopoverProps {
  address: string;
  onClose: () => void;
}

export default function ParticipantPopover({ address, onClose }: ParticipantPopoverProps) {
  const profile = useMemo(() => {
    return pactStore.getReputation(address);
  }, [address]);

  const tierInfo = useMemo(() => {
    const score = profile?.score || 0;
    if (score >= 100) return { name: "Diamond", color: "#b9f2ff", icon: "💎" };
    if (score >= 50) return { name: "Gold", color: "#ffd700", icon: "🥇" };
    if (score >= 20) return { name: "Silver", color: "#c0c0c0", icon: "🥈" };
    if (score >= 1) return { name: "Bronze", color: "#cd7f32", icon: "🥉" };
    return { name: "Unranked", color: "#64748b", icon: "○" };
  }, [profile]);

  return (
    <div style={{
      position: "absolute", zIndex: 50, top: "100%", left: 0, marginTop: 8,
      width: 280, padding: 20,
      background: "rgba(18, 19, 26, 0.98)", border: "1px solid rgba(255, 255, 255, 0.12)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)", borderRadius: 14,
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      animation: "fadeIn 0.2s ease-out"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Participant Trust Profile</span>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ background: "none", border: "none", color: "#64748b", fontSize: 14, cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 24 }}>{tierInfo.icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{tierInfo.name} Tier</div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "var(--font-mono)", marginTop: 2 }}>{address.slice(0, 12)}...{address.slice(-6)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 10, color: "#64748b" }}>Reputation</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#ffd700" }}>{profile?.score || 0} pts</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 10, color: "#64748b" }}>Pacts Met</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#22c55e" }}>{profile?.completedPacts || 0} complete</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#94a3b8", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span>Disputed: {profile?.disputedPacts || 0}</span>
        <span>Earned: {profile?.totalEarned || "0 STX"}</span>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

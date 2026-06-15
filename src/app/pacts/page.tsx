"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { pactStore } from "@/lib/pactStore";
import { Pact } from "@/lib/types";

const msColors: Record<number, { bg: string; color: string; label: string }> = {
  0: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8", label: "Pending" },
  1: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", label: "In Progress" },
  2: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "Submitted" },
  3: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Approved" },
  4: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", label: "Rejected" },
  5: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6", label: "Paid" },
};

function PactDetailContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const [pact, setPact] = useState<Pact | null>(null);

  useEffect(() => {
    const id = idParam ? parseInt(idParam) : 1;
    const p = pactStore.getPactById(id);
    if (p) {
      setPact(p);
    }
  }, [idParam]);

  if (!pact) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <h2>Pact Not Found</h2>
          <p style={{ color: "#64748b", marginTop: 10 }}>The requested agreement ID does not exist or has expired.</p>
        </div>
      </div>
    );
  }

  const handleMilestoneAction = (milestoneId: number, newState: any) => {
    const updated = pactStore.updateMilestoneState(pact.id, milestoneId, newState);
    if (updated) {
      setPact({ ...updated });
    }
  };

  const handleFundPact = () => {
    const p = { ...pact };
    p.state = "active";
    p.fundedAmount = p.totalAmount;
    if (p.milestones.length > 0) p.milestones[0].state = 1; // Mark first milestone In Progress
    pactStore.updatePact(p);
    setPact(p);
  };

  const handleCancelPact = () => {
    const p = { ...pact };
    p.state = "cancelled";
    pactStore.updatePact(p);
    setPact(p);
  };

  const completedMs = pact.milestones.filter(m => m.state >= 3).length;
  const progress = pact.milestones.length > 0 ? (completedMs / pact.milestones.length) * 100 : 0;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>Pact #{pact.id}</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{pact.title}</h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>{pact.description}</p>
        </div>

        {/* Info Grid */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20 }}>
            {[
              { label: "Total Value", value: pact.totalAmount },
              { label: "Funded", value: pact.fundedAmount },
              { label: "Released", value: pact.releasedAmount },
              { label: "State", value: pact.state },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4, textTransform: "capitalize" }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, textTransform: i === 3 ? "capitalize" : "none" }}>{item.value}</div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
              <span>Progress</span>
              <span>{completedMs}/{pact.milestones.length} milestones</span>
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
            { label: "Client", addr: pact.client, icon: "👤" },
            { label: "Provider", addr: pact.provider, icon: "🛠️" },
          ].map((p, i) => (
            <div key={i} className="glass-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24 }}>{p.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{p.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#f1f5f9" }}>
                  {p.addr.length > 15 ? `${p.addr.slice(0, 8)}...${p.addr.slice(-6)}` : p.addr}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Milestones Timeline */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Milestones</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {pact.milestones.map((ms, i) => {
            const st = msColors[ms.state] || { bg: "rgba(255,255,255,0.05)", color: "#fff", label: "Unknown" };
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
                  <div style={{ fontSize: 13, color: "#64748b" }}>{ms.description}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, minWidth: 80, textAlign: "right" }}>{ms.amount}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {pact.state === "active" && (
                    <>
                      {ms.state === 0 && (
                        <button onClick={() => handleMilestoneAction(ms.id, 1)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 11 }}>
                          🚀 Start
                        </button>
                      )}
                      {(ms.state === 1 || ms.state === 4) && (
                        <button onClick={() => handleMilestoneAction(ms.id, 2)} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 11 }}>
                          📤 Submit
                        </button>
                      )}
                      {ms.state === 2 && (
                        <>
                          <button onClick={() => handleMilestoneAction(ms.id, 5)} className="btn btn-success" style={{ padding: "6px 12px", fontSize: 11 }}>
                            ✅ Approve
                          </button>
                          <button onClick={() => handleMilestoneAction(ms.id, 4)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 11 }}>
                            ❌ Reject
                          </button>
                        </>
                      )}
                    </>
                  )}
                  <div style={{ padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24 }}>
          {pact.state === "created" && (
            <button onClick={handleFundPact} className="btn btn-primary shimmer-btn" style={{ padding: "12px 28px" }}>
              ⚡ Fund Pact
            </button>
          )}
          {pact.state === "active" && (
            <>
              <button className="btn btn-danger">🚨 Raise Dispute</button>
              <button onClick={handleCancelPact} className="btn btn-secondary" style={{ padding: "12px 28px" }}>
                ❌ Cancel Pact
              </button>
            </>
          )}
          {pact.state === "completed" && (
            <div className="badge badge-success" style={{ fontSize: 14, padding: "10px 20px" }}>
              🏆 Project Completed Successfully
            </div>
          )}
          {pact.state === "disputed" && (
            <div className="badge badge-danger" style={{ fontSize: 14, padding: "10px 20px" }}>
              🚨 Under Arbitration
            </div>
          )}
          {pact.state === "cancelled" && (
            <div className="badge badge-danger" style={{ fontSize: 14, padding: "10px 20px" }}>
              ❌ Pact Cancelled & Refunded
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PactDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Loading details...</p>
      </div>
    }>
      <PactDetailContent />
    </Suspense>
  );
}

"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SkeletonLoader from "@/components/SkeletonLoader";
import { useToast } from "@/components/Toaster";
import { pactStore } from "@/lib/pactStore";
import { Pact } from "@/lib/types";
import confetti from "canvas-confetti";

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
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const id = idParam ? parseInt(idParam) : 1;
      const p = pactStore.getPactById(id);
      if (p) {
        setPact(p);
      }
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [idParam]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 80, height: 24, borderRadius: 12, background: "rgba(255,255,255,0.05)", marginBottom: 12 }} className="animate-pulse" />
            <div style={{ width: "60%", height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", marginBottom: 8 }} className="animate-pulse" />
            <div style={{ width: "40%", height: 16, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} className="animate-pulse" />
          </div>
          <SkeletonLoader count={1} type="card" />
          <div style={{ marginTop: 24 }}>
            <SkeletonLoader count={3} type="row" />
          </div>
        </div>
      </div>
    );
  }

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

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeTitle, setDisputeTitle] = useState("");
  const [disputeReason, setDisputeReason] = useState("");

  const [showObstacleModal, setShowObstacleModal] = useState(false);
  const [obstacleTargetId, setObstacleTargetId] = useState<number | null>(null);
  const [obstacleText, setObstacleText] = useState("");

  const handleMilestoneAction = (milestoneId: number, newState: any) => {
    const updated = pactStore.updateMilestoneState(pact.id, milestoneId, newState);
    if (updated) {
      setPact({ ...updated });
      if (newState === 1) toast("Milestone started!", "info");
      if (newState === 2) toast("Milestone submitted for review.", "info");
      if (newState === 5) {
        toast("Milestone approved! Funds released.", "success");
        if (updated.state === "completed") {
          const duration = 3 * 1000;
          const end = Date.now() + duration;
          const frame = () => {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#22c55e'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#22c55e'] });
            if (Date.now() < end) requestAnimationFrame(frame);
          };
          frame();
          toast("Pact completed! Massive payout!", "success");
        } else {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }
      if (newState === 4) toast("Milestone rejected.", "error");
    }
  };

  const handleFundPact = () => {
    const p = { ...pact };
    p.state = "active";
    p.fundedAmount = p.totalAmount;
    if (p.milestones.length > 0) p.milestones[0].state = 1; // Mark first milestone In Progress
    pactStore.updatePact(p);
    setPact(p);
    toast("Pact successfully funded and active!", "success");
  };

  const handleCancelPact = () => {
    const p = { ...pact };
    p.state = "cancelled";
    pactStore.updatePact(p);
    setPact(p);
    toast("Pact cancelled. Funds returned.", "info");
  };

  const handleRaiseDispute = () => {
    if (!disputeTitle.trim() || !disputeReason.trim()) return;
    const disp = pactStore.raiseDispute(pact.id, disputeTitle, disputeReason);
    if (disp) {
      const p = pactStore.getPactById(pact.id);
      if (p) setPact(p);
      setShowDisputeModal(false);
      setDisputeTitle("");
      setDisputeReason("");
      toast("Dispute escalated to DAO arbiters.", "warning");
    }
  };

  const handleReportObstacle = () => {
    if (!obstacleTargetId || !obstacleText.trim()) return;
    const updated = pactStore.reportMilestoneObstacle(pact.id, obstacleTargetId, obstacleText);
    if (updated) setPact({ ...updated });
    setShowObstacleModal(false);
    setObstacleTargetId(null);
    setObstacleText("");
    toast("Obstacle flagged.", "warning");
  };

  const handleClearObstacle = (milestoneId: number) => {
    const updated = pactStore.clearMilestoneObstacle(pact.id, milestoneId);
    if (updated) setPact({ ...updated });
    toast("Obstacle cleared.", "success");
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
                      {(ms.state === 1 || ms.state === 4) && !ms.obstacle && (
                        <>
                          <button onClick={() => handleMilestoneAction(ms.id, 2)} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 11 }}>
                            📤 Submit
                          </button>
                          <button onClick={() => { setObstacleTargetId(ms.id); setShowObstacleModal(true); }} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 11, background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                            ⚠️ Flag Obstacle
                          </button>
                        </>
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
                {ms.obstacle && (
                  <div style={{ width: "100%", marginTop: 12, padding: 16, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>⚠️ Blocked / Obstacle Reported</div>
                        <div style={{ fontSize: 13, color: "#f87171" }}>{ms.obstacle}</div>
                      </div>
                      <button onClick={() => handleClearObstacle(ms.id)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 11, borderColor: "rgba(239,68,68,0.4)" }}>
                        Clear Block
                      </button>
                    </div>
                  </div>
                )}
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
              <button onClick={() => setShowDisputeModal(true)} className="btn btn-danger">🚨 Raise Dispute</button>
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

      {/* Dispute Modal Dialog */}
      {showDisputeModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100,
        }}>
          <div className="glass-card" style={{ padding: 36, width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>🚨 Escalate to Arbitration</h2>
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Briefly explain the issue. Staked DAO arbiters will vote on-chain based on the submitted evidence.</p>
            
            <div className="input-group">
              <label className="input-label">Dispute Title</label>
              <input className="input-field" placeholder="e.g. Incomplete features in Milestone 2" value={disputeTitle} onChange={e => setDisputeTitle(e.target.value)} />
            </div>

            <div className="input-group">
              <label className="input-label">Reason / Explanation</label>
              <textarea className="input-field" placeholder="Provide link to code, deliverables, or detail the latency issue..." value={disputeReason} onChange={e => setDisputeReason(e.target.value)} style={{ minHeight: 120 }} />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setShowDisputeModal(false)} className="btn btn-secondary" style={{ padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleRaiseDispute} className="btn btn-danger" style={{ padding: "10px 20px" }}>Escalate to DAO</button>
            </div>
          </div>
        </div>
      )}

      {/* Obstacle Modal Dialog */}
      {showObstacleModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100,
        }}>
          <div className="glass-card" style={{ padding: 36, width: "100%", maxWidth: 450, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#ef4444" }}>⚠️ Report Milestone Obstacle</h2>
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Flag this milestone if you are blocked or encountering an issue preventing progress.</p>
            
            <div className="input-group">
              <label className="input-label">Obstacle Description</label>
              <textarea className="input-field" placeholder="E.g. Waiting on API keys from the client..." value={obstacleText} onChange={e => setObstacleText(e.target.value)} style={{ minHeight: 100 }} />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setShowObstacleModal(false)} className="btn btn-secondary" style={{ padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleReportObstacle} className="btn btn-danger" style={{ padding: "10px 20px" }}>Report Block</button>
            </div>
          </div>
        </div>
      )}
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

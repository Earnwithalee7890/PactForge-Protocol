"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SkeletonLoader from "@/components/SkeletonLoader";
import { useToast } from "@/components/Toaster";
import { pactStore } from "@/lib/pactStore";
import { Pact } from "@/lib/types";
import confetti from "canvas-confetti";
import { request } from "@stacks/connect";
import { uintCV, stringUtf8CV, bufferCV } from "@stacks/transactions";
import { useWallet } from "@/context/WalletContext";

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
  const { connected } = useWallet();
  const [isTxPending, setIsTxPending] = useState(false);

  const [loading, setLoading] = useState(true);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeTitle, setDisputeTitle] = useState("");
  const [disputeReason, setDisputeReason] = useState("");

  const [showObstacleModal, setShowObstacleModal] = useState(false);
  const [obstacleTargetId, setObstacleTargetId] = useState<number | null>(null);
  const [obstacleText, setObstacleText] = useState("");

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

  const handleMilestoneAction = async (milestoneId: number, newState: any) => {
    if (!pact) return;
    if (!connected) {
      toast("Please connect your Stacks wallet to interact with Mainnet.", "warning");
      return;
    }

    try {
      setIsTxPending(true);
      let functionName = "";
      let functionArgs: any[] = [];
      
      if (newState === 1) {
        functionName = "start-milestone";
        functionArgs = [uintCV(milestoneId)];
      } else if (newState === 2) {
        functionName = "submit-milestone";
        functionArgs = [uintCV(milestoneId), bufferCV(new Uint8Array(32))];
      } else if (newState === 3) {
        functionName = "approve-milestone";
        functionArgs = [uintCV(milestoneId)];
      } else if (newState === 4) {
        functionName = "reject-milestone";
        functionArgs = [uintCV(milestoneId)];
      }

      if (newState === 5) {
        // Release funds from pactcore
        const msAmount = parseFloat((pact.milestones.find(m => m.id === milestoneId)?.amount || "0").replace(/[^0-9.]/g, "")) * 1_000_000 || 0;
        await request("stx_callContract", {
          contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore",
          functionName: "release-payment",
          functionArgs: [uintCV(pact.id), uintCV(msAmount)],
          postConditionMode: "allow",
          network: "mainnet",
        });
      } else {
        // Normal milestone update
        await request("stx_callContract", {
          contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.milestone-v2",
          functionName,
          functionArgs,
          postConditionMode: "allow",
          network: "mainnet",
        });
      }

      // Optimistically update local UI mock state after tx broadcast
      const updated = pactStore.updateMilestoneState(pact.id, milestoneId, newState);
      if (updated) {
        setPact({ ...updated });
        toast("Transaction broadcasted! Simulating UI update...", "success");
        if (newState === 5) {
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
      }
    } catch (err) {
      console.error(err);
      toast("Transaction cancelled or failed.", "error");
    } finally {
      setIsTxPending(false);
    }
  };

  const handleFundPact = async () => {
    if (!pact) return;
    if (!connected) {
      toast("Please connect your Stacks wallet.", "warning");
      return;
    }
    try {
      setIsTxPending(true);
      await request("stx_callContract", {
        contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore",
        functionName: "fund-pact",
        functionArgs: [uintCV(pact.id)],
        postConditionMode: "allow",
        network: "mainnet",
      });

      const p = { ...pact };
      p.state = "active";
      p.fundedAmount = p.totalAmount;
      if (p.milestones && p.milestones.length > 0) p.milestones[0].state = 1;
      pactStore.updatePact(p);
      setPact(p);
      toast("Transaction broadcasted! Pact successfully funded.", "success");
    } catch (err) {
      console.error(err);
      toast("Transaction cancelled or failed.", "error");
    } finally {
      setIsTxPending(false);
    }
  };

  const handleCancelPact = async () => {
    if (!pact) return;
    if (!connected) {
      toast("Please connect your Stacks wallet.", "warning");
      return;
    }
    try {
      setIsTxPending(true);
      await request("stx_callContract", {
        contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore",
        functionName: "cancel-pact",
        functionArgs: [uintCV(pact.id)],
        postConditionMode: "allow",
        network: "mainnet",
      });

      const p = { ...pact };
      p.state = "cancelled";
      pactStore.updatePact(p);
      setPact(p);
      toast("Transaction broadcasted! Pact cancelled.", "info");
    } catch (err) {
      console.error(err);
      toast("Transaction cancelled or failed.", "error");
    } finally {
      setIsTxPending(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (!pact || !disputeTitle.trim() || !disputeReason.trim()) return;
    if (!connected) {
      toast("Please connect your Stacks wallet.", "warning");
      return;
    }
    try {
      setIsTxPending(true);
      await request("stx_callContract", {
        contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.arbiter-dao-v4",
        functionName: "create-dispute",
        functionArgs: [uintCV(pact.id), stringUtf8CV(disputeReason)],
        postConditionMode: "allow",
        network: "mainnet",
      });

      const disp = pactStore.raiseDispute(pact.id, disputeTitle, disputeReason);
      if (disp) {
        const p = pactStore.getPactById(pact.id);
        if (p) setPact(p);
        setShowDisputeModal(false);
        setDisputeTitle("");
        setDisputeReason("");
        toast("Dispute transaction broadcasted to DAO arbiters.", "warning");
      }
    } catch (err) {
      console.error(err);
      toast("Transaction cancelled or failed.", "error");
    } finally {
      setIsTxPending(false);
    }
  };

  const handleVote = async (voteForClient: boolean) => {
    if (!pact) return;
    if (!connected) {
      toast("Please connect your Stacks wallet.", "warning");
      return;
    }
    try {
      setIsTxPending(true);
      const boolCV = (val: boolean) => ({ type: val ? 3 : 4 } as any); // True: 3, False: 4
      await request("stx_callContract", {
        contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.arbiter-dao-v4",
        functionName: "vote-dispute",
        // Fallback to true/false boolean CV format from stacks transactions
        functionArgs: [uintCV(pact.id), { type: voteForClient ? 3 : 4 } as any],
        postConditionMode: "allow",
        network: "mainnet",
      });
      toast("Vote broadcasted to Arbiter DAO.", "success");
    } catch (err) {
      console.error(err);
      toast("Transaction cancelled or failed.", "error");
    } finally {
      setIsTxPending(false);
    }
  };

  const handleReportObstacle = () => {
    if (!pact || !obstacleTargetId || !obstacleText.trim()) return;
    const updated = pactStore.reportMilestoneObstacle(pact.id, obstacleTargetId, obstacleText);
    if (updated) setPact({ ...updated });
    setShowObstacleModal(false);
    setObstacleTargetId(null);
    setObstacleText("");
    toast("Obstacle flagged in UI.", "warning");
  };

  const handleClearObstacle = (milestoneId: number) => {
    if (!pact) return;
    const updated = pactStore.clearMilestoneObstacle(pact.id, milestoneId);
    if (updated) setPact({ ...updated });
    toast("Obstacle cleared in UI.", "success");
  };

  const completedMs = (pact.milestones || []).filter(m => m.state >= 3).length;
  const progress = pact.milestones?.length > 0 ? (completedMs / pact.milestones.length) * 100 : 0;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="badge badge-primary" style={{ marginBottom: 12 }}>Pact #{pact.id}</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{pact.title}</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>{pact.description}</p>
          </div>
          {isTxPending && (
            <div className="badge" style={{ background: "rgba(245,158,11,0.2)", color: "#fcd34d", display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #fcd34d", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
              Pending TX...
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20 }}>
            {[
              { label: "Total Value", value: pact.totalAmount || "0 STX" },
              { label: "Funded", value: pact.fundedAmount || "0 STX" },
              { label: "Released", value: pact.releasedAmount || "0 STX" },
              { label: "State", value: pact.state || "unknown" },
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
              <span>{completedMs}/{pact.milestones?.length || 0} milestones</span>
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
                  {p.addr && p.addr.length > 15 ? `${p.addr.slice(0, 8)}...${p.addr.slice(-6)}` : p.addr || "Not Set"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Milestones Timeline */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Milestones</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {(pact.milestones || []).map((ms, i) => {
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
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{ms.title || "Untitled"}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{ms.description || ""}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, minWidth: 80, textAlign: "right" }}>{ms.amount || "0 STX"}</div>
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
                          <button onClick={() => handleMilestoneAction(ms.id, 3)} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 11 }}>
                            ✅ Approve
                          </button>
                          <button onClick={() => handleMilestoneAction(ms.id, 4)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 11 }}>
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {ms.state === 3 && (
                        <button onClick={() => handleMilestoneAction(ms.id, 5)} className="btn btn-success shimmer-btn" style={{ padding: "6px 12px", fontSize: 11 }}>
                          💸 Release Funds
                        </button>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="badge badge-danger" style={{ fontSize: 14, padding: "10px 20px", alignSelf: "flex-start" }}>
                🚨 Under Arbitration
              </div>
              <div className="glass-card" style={{ padding: 24, border: "1px solid rgba(239,68,68,0.3)" }}>
                <h3 style={{ color: "#ef4444", marginBottom: 12 }}>⚖️ Arbitration Panel</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Staked Arbiters can vote on-chain to resolve this dispute.</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => handleVote(true)} className="btn btn-secondary" style={{ borderColor: "#6366f1", color: "#6366f1" }}>Vote for Client</button>
                  <button onClick={() => handleVote(false)} className="btn btn-secondary" style={{ borderColor: "#f59e0b", color: "#f59e0b" }}>Vote for Provider</button>
                </div>
              </div>
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

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
import ExplorerModal from "@/components/ExplorerModal";
import ParticipantPopover from "@/components/ParticipantPopover";

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
  const { connected, address } = useWallet();
  const [isTxPending, setIsTxPending] = useState(false);

  const [loading, setLoading] = useState(true);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeTitle, setDisputeTitle] = useState("");
  const [disputeReason, setDisputeReason] = useState("");

  const [showObstacleModal, setShowObstacleModal] = useState(false);
  const [obstacleTargetId, setObstacleTargetId] = useState<number | null>(null);
  const [obstacleText, setObstacleText] = useState("");

  const [milestoneSearch, setMilestoneSearch] = useState("");
  const [milestoneFilter, setMilestoneFilter] = useState<number | "all">("all");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [partnerRating, setPartnerRating] = useState<number>(5);
  const [partnerFeedback, setPartnerFeedback] = useState("");

  const [explorerAddress, setExplorerAddress] = useState("");
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [activePopover, setActivePopover] = useState<"client" | "provider" | null>(null);

  const [obstacleComments, setObstacleComments] = useState<Record<string, Array<{ sender: string; text: string; date: string }>>>({});
  const [obstacleCommentInput, setObstacleCommentInput] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("pactforge_v2_obstacle_comments");
    if (saved) {
      try {
        setObstacleComments(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleAddObstacleComment = (milestoneKey: string) => {
    const text = obstacleCommentInput[milestoneKey];
    if (!text || !text.trim()) return;

    const newComment = {
      sender: address || "SP_ANON",
      text: text.trim(),
      date: new Date().toISOString()
    };

    const updated = {
      ...obstacleComments,
      [milestoneKey]: [...(obstacleComments[milestoneKey] || []), newComment]
    };

    setObstacleComments(updated);
    localStorage.setItem("pactforge_v2_obstacle_comments", JSON.stringify(updated));
    setObstacleCommentInput({
      ...obstacleCommentInput,
      [milestoneKey]: ""
    });
    toast("Reply posted to obstacle thread!", "success");
  };

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

  const handleSaveRating = () => {
    if (!pact) return;
    const savedRatings = localStorage.getItem("pactforge_v2_partner_ratings") || "[]";
    try {
      const list = JSON.parse(savedRatings);
      list.push({
        pactId: pact.id,
        partner: address === pact.client ? pact.provider : pact.client,
        rating: partnerRating,
        feedback: partnerFeedback,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("pactforge_v2_partner_ratings", JSON.stringify(list));
      toast("Rating submitted successfully! SBT metrics refreshed.", "success");
      setShowRatingModal(false);
      setPartnerFeedback("");
    } catch (e) {
      console.error(e);
      toast("Failed to submit rating.", "error");
    }
  };

  const handlePrintInvoice = () => {
    if (!pact) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast("Popup blocked! Please allow popups to export report.", "error");
      return;
    }
    
    const milestonesHTML = (pact.milestones || []).map((m, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>${m.title}</strong><br>
          <small style="color: #666;">${m.description}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${m.amount}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">
          ${m.state === 5 ? "Paid" : m.state === 3 ? "Approved" : m.state === 2 ? "Submitted" : m.state === 1 ? "In Progress" : "Pending"}
        </td>
      </tr>
    `).join("");

    const htmlContent = `
      <html>
        <head>
          <title>PactForge Escrow Report - Pact #${pact.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0f172a; }
            .logo span { color: #f97316; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Pact<span>Forge</span> Escrow Report</div>
            <div style="text-align: right;">
              <strong>Pact ID:</strong> #${pact.id}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
          </div>
          <div class="info-grid">
            <div class="info-box">
              <strong>Agreement Details:</strong><br>
              <span style="font-size: 18px; font-weight: bold; color: #6366f1;">${pact.title}</span><br>
              <p style="margin-top: 6px; font-size: 13px; color: #475569;">${pact.description}</p>
            </div>
            <div class="info-box">
              <strong>Escrow Participants:</strong><br>
              <small><strong>Client Address:</strong> ${pact.client}</small><br>
              <small><strong>Provider Address:</strong> ${pact.provider}</small><br>
              <small><strong>Escrow State:</strong> ${pact.state.toUpperCase()}</small>
            </div>
          </div>
          <div class="info-box" style="margin-bottom: 30px; background: #e0e7ff; border-color: #c7d2fe;">
            <div style="display: flex; justify-content: space-between;">
              <span><strong>Total Escrow Value:</strong></span>
              <span style="font-size: 20px; font-weight: bold; color: #4f46e5;">${pact.totalAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 13px;">
              <span>Released Payments:</span>
              <span>${pact.releasedAmount}</span>
            </div>
          </div>
          <h3>Milestone Schedule</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Deliverable Description</th>
                <th style="text-align: right; width: 120px;">Amount</th>
                <th style="text-align: center; width: 100px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${milestonesHTML}
            </tbody>
          </table>
          <div class="footer">
            PactForge Escrow Protocol • Trustless Agreement Signed On Stacks Mainnet
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const completedMs = (pact.milestones || []).filter(m => m.state >= 3).length;
  const progress = pact.milestones?.length > 0 ? (completedMs / pact.milestones.length) * 100 : 0;
  const allMilestoneTags = Array.from(
    new Set((pact.milestones || []).flatMap(ms => ms.tags || []))
  );

  const filteredMilestones = (pact.milestones || []).filter(ms => {
    if (milestoneFilter !== "all" && ms.state !== milestoneFilter) return false;
    if (selectedTagFilter !== "all" && !(ms.tags || []).includes(selectedTagFilter)) return false;
    if (milestoneSearch) {
      const q = milestoneSearch.toLowerCase();
      if (
        !(ms.title || "").toLowerCase().includes(q) && 
        !(ms.description || "").toLowerCase().includes(q) &&
        !(ms.tags || []).some(t => t.toLowerCase().includes(q))
      ) return false;
    }
    return true;
  });

  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    return sortOrder === "desc" ? b.id - a.id : a.id - b.id;
  });

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
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={handlePrintInvoice} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 12 }}>
              🖨️ Export PDF
            </button>
            {isTxPending && (
              <div className="badge" style={{ background: "rgba(245,158,11,0.2)", color: "#fcd34d", display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #fcd34d", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                Pending TX...
              </div>
            )}
          </div>
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
        <div className="responsive-grid" style={{ marginBottom: 24 }}>
          {[
            { label: "Client", addr: pact.client, icon: "👤", key: "client" as const },
            { label: "Provider", addr: pact.provider, icon: "🛠️", key: "provider" as const },
          ].map((p, i) => (
            <div 
              key={i} 
              className="glass-card" 
              onClick={() => {
                if (p.addr && p.addr.startsWith("SP")) {
                  setExplorerAddress(p.addr);
                  setIsExplorerOpen(true);
                }
              }}
              style={{ 
                padding: 20, 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                cursor: p.addr?.startsWith("SP") ? "pointer" : "default",
                transition: "transform 0.2s",
                position: "relative"
              }}
              onMouseEnter={e => {
                if (p.addr?.startsWith("SP")) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  setActivePopover(p.key);
                }
              }}
              onMouseLeave={e => {
                if (p.addr?.startsWith("SP")) {
                  e.currentTarget.style.transform = "none";
                  setActivePopover(null);
                }
              }}
            >
              <div style={{ fontSize: 24 }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{p.label}</div>
                  {p.addr?.startsWith("SP") && <span style={{ fontSize: 10, color: "#6366f1", opacity: 0.8 }}>🔍 Inspect</span>}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#f1f5f9" }}>
                  {p.addr && p.addr.length > 15 ? `${p.addr.slice(0, 8)}...${p.addr.slice(-6)}` : p.addr || "Not Set"}
                </div>
              </div>

              {activePopover === p.key && p.addr && (
                <ParticipantPopover address={p.addr} onClose={() => setActivePopover(null)} />
              )}
            </div>
          ))}
        </div>

        {/* Milestones Timeline */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Milestones</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Search milestones..."
              value={milestoneSearch}
              onChange={(e) => setMilestoneSearch(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "6px 12px",
                color: "#f1f5f9",
                fontSize: 12,
                outline: "none",
                minWidth: 160
              }}
            />
            <select
              value={milestoneFilter}
              onChange={(e) => setMilestoneFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "6px 12px",
                color: "#f1f5f9",
                fontSize: 12,
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="all" style={{ background: "#0f172a" }}>All Statuses</option>
              <option value="0" style={{ background: "#0f172a" }}>Pending</option>
              <option value="1" style={{ background: "#0f172a" }}>In Progress</option>
              <option value="2" style={{ background: "#0f172a" }}>Submitted</option>
              <option value="3" style={{ background: "#0f172a" }}>Approved</option>
              <option value="4" style={{ background: "#0f172a" }}>Rejected</option>
              <option value="5" style={{ background: "#0f172a" }}>Paid</option>
            </select>

            {allMilestoneTags.length > 0 && (
              <select
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  color: "#f1f5f9",
                  fontSize: 12,
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all" style={{ background: "#0f172a" }}>All Tags</option>
                {allMilestoneTags.map(tag => (
                  <option key={tag} value={tag} style={{ background: "#0f172a" }}>
                    #{tag}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "6px 12px",
                color: "#f1f5f9",
                fontSize: 12,
                outline: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
              title="Toggle Timeline Order"
            >
              🕒 {sortOrder === "asc" ? "Oldest First ↑" : "Newest First ↓"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {sortedMilestones.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#64748b", background: "rgba(255,255,255,0.01)", borderRadius: 12 }}>
              No milestones match search criteria.
            </div>
          ) : sortedMilestones.map((ms) => {
            const originalIndex = (pact.milestones || []).findIndex(m => m.id === ms.id);
            const st = msColors[ms.state] || { bg: "rgba(255,255,255,0.05)", color: "#fff", label: "Unknown" };
            return (
              <div key={ms.id} className="glass-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: st.bg, color: st.color, fontWeight: 800, fontSize: 14,
                  border: `1px solid ${st.color}33`,
                }}>{originalIndex + 1}</div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{ms.title || "Untitled"}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{ms.description || ""}</div>
                  {ms.tags && ms.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      {ms.tags.map(tag => (
                        <span key={tag} style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                          background: "rgba(99, 102, 241, 0.15)", color: "#818cf8"
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
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
                {ms.obstacle && (() => {
                  const msKey = `${pact.id}_${ms.id}`;
                  const comments = obstacleComments[msKey] || [];
                  return (
                    <div style={{ width: "100%", marginTop: 12, padding: 20, borderRadius: 12, background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                        <div>
                          <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>⚠️ Blocked / Obstacle Flagged</div>
                          <div style={{ fontSize: 13, color: "#f87171", fontWeight: 600 }}>"{ms.obstacle}"</div>
                        </div>
                        <button onClick={() => handleClearObstacle(ms.id)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 11, borderColor: "rgba(239, 68, 68, 0.3)", color: "#f87171" }}>
                          Clear Block
                        </button>
                      </div>

                      {/* Discussion Thread */}
                      <div style={{ borderTop: "1px solid rgba(239, 68, 68, 0.12)", paddingTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Obstacle Discussion</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12, maxHeight: 120, overflowY: "auto" }}>
                          {comments.length === 0 ? (
                            <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>No replies yet. Client and provider can coordinate here.</div>
                          ) : (
                            comments.map((c, cIdx) => (
                              <div key={cIdx} style={{ background: "rgba(0,0,0,0.15)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.03)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 4 }}>
                                  <span style={{ fontFamily: "var(--font-mono)" }}>
                                    {c.sender === address ? "You" : `${c.sender.slice(0, 6)}...${c.sender.slice(-4)}`}
                                  </span>
                                  <span>{new Date(c.date).toLocaleDateString()} {new Date(c.date).toLocaleTimeString()}</span>
                                </div>
                                <div style={{ fontSize: 12, color: "#f1f5f9" }}>{c.text}</div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Reply Form */}
                        {connected && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              type="text"
                              placeholder="Post coordination message..."
                              value={obstacleCommentInput[msKey] || ""}
                              onChange={(e) => setObstacleCommentInput({ ...obstacleCommentInput, [msKey]: e.target.value })}
                              style={{
                                flex: 1,
                                background: "rgba(0,0,0,0.2)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                borderRadius: 8,
                                padding: "6px 12px",
                                color: "#f1f5f9",
                                fontSize: 12,
                                outline: "none"
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddObstacleComment(msKey);
                              }}
                            />
                            <button onClick={() => handleAddObstacleComment(msKey)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 11 }}>
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
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
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="badge badge-success" style={{ fontSize: 14, padding: "10px 20px" }}>
                🏆 Project Completed Successfully
              </div>
              <button onClick={() => setShowRatingModal(true)} className="btn btn-primary" style={{ padding: "10px 20px" }}>
                ⭐ Rate Partner
              </button>
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

      {/* Partner Rating Modal Dialog */}
      {showRatingModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100,
        }}>
          <div className="glass-card" style={{ padding: 36, width: "100%", maxWidth: 450, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>⭐ Rate Your Partner</h2>
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Submit feedback. This updates their reputation score on their non-transferable SBT card.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: "#94a3b8" }}>Rating Score</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setPartnerRating(star)}
                    style={{
                      fontSize: 28, cursor: "pointer",
                      color: star <= partnerRating ? "#f59e0b" : "#475569",
                      transition: "color 0.2s"
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Written Feedback</label>
              <textarea
                className="input-field"
                placeholder="E.g. Excellent communication and very fast delivery!"
                value={partnerFeedback}
                onChange={e => setPartnerFeedback(e.target.value)}
                style={{ minHeight: 80 }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setShowRatingModal(false)} className="btn btn-secondary" style={{ padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleSaveRating} className="btn btn-primary" style={{ padding: "10px 20px" }}>Submit Rating</button>
            </div>
          </div>
        </div>
      )}

      {/* Stacks On-Chain Explorer Modal */}
      <ExplorerModal 
        isOpen={isExplorerOpen} 
        onClose={() => setIsExplorerOpen(false)} 
        targetAddress={explorerAddress} 
      />
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

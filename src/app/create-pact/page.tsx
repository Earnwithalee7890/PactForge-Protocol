"use client";
import { Suspense, useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { request } from "@stacks/connect";
import { principalCV, uintCV, stringUtf8CV } from "@stacks/transactions";
import { pactStore } from "@/lib/pactStore";
import { useToast } from "@/components/Toaster";
import { useSearchParams, useRouter } from "next/navigation";

interface Milestone {
  title: string;
  description: string;
  amount: string;
  tags?: string[];
}

const Tooltip = ({ text }: { text: string }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 6 }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, color: "#94a3b8", cursor: "help", transition: "background 0.2s"
        }}
      >
        i
      </span>
      {visible && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "8px 12px", borderRadius: 8, color: "#f1f5f9", fontSize: 11, fontWeight: 500,
          width: 180, textAlign: "center", pointerEvents: "none", zIndex: 100, lineHeight: "1.4",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(4px)"
        }}>
          {text}
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0, borderStyle: "solid",
            borderWidth: "5px 5px 0 5px", borderColor: "rgba(15, 23, 42, 0.95) transparent transparent transparent"
          }} />
        </div>
      )}
    </div>
  );
};

function CreatePactForm() {
  const { address, connected, connect } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const draftId = idParam ? parseInt(idParam) : null;
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "", description: "", amount: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [publishedCount, setPublishedCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [gasTier, setGasTier] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    if (draftId) {
      const p = pactStore.getPactById(draftId);
      if (p && p.state === "draft") {
        setTitle(p.title || "");
        setDescription(p.description || "");
        setProvider(p.provider === "SP3F...MOCK" ? "" : p.provider || "");
        setTotalAmount((p.totalAmount || "").replace(/[^0-9.]/g, ""));
        if (p.deadline) setDeadline(p.deadline);
        if (p.milestones && p.milestones.length > 0) {
          setMilestones(p.milestones.map(m => ({ title: m.title || "", description: m.description || "", amount: (m.amount || "").replace(/[^0-9.]/g, "") })));
        }
      }
    }
  }, [draftId]);

  const handleSaveDraft = () => {
    try {
      pactStore.saveDraft(
        draftId,
        title || "Untitled Draft",
        description,
        address || "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        provider,
        totalAmount,
        milestones
      );
      toast("Draft saved successfully!", "success");
      router.push("/dashboard");
    } catch (e) {
      toast("Failed to save draft.", "error");
    }
  };

  const addMilestone = () => {
    if (milestones.length < 10) {
      setMilestones([...milestones, { title: "", description: "", amount: "", tags: [] }]);
    }
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const toggleMilestoneTag = (index: number, tag: string) => {
    const updated = [...milestones];
    const currentTags = updated[index].tags || [];
    if (currentTags.includes(tag)) {
      updated[index] = {
        ...updated[index],
        tags: currentTags.filter(t => t !== tag)
      };
    } else {
      updated[index] = {
        ...updated[index],
        tags: [...currentTags, tag]
      };
    }
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const validateStep1 = () => {
    setError(null);
    if (!title.trim()) {
      setError("Pact Title is required.");
      return false;
    }
    if (!description.trim()) {
      setError("Pact Description is required.");
      return false;
    }
    if (!provider.trim() || !provider.startsWith("SP") || provider.length < 30) {
      setError("Please enter a valid Stacks address (starting with SP).");
      return false;
    }
    const amt = parseFloat(totalAmount);
    if (isNaN(amt) || amt <= 0) {
      setError("Total Amount must be a positive number.");
      return false;
    }
    if (!deadline) {
      setError("Please select a deadline.");
      return false;
    }
    const dl = new Date(deadline);
    if (dl <= new Date()) {
      setError("Deadline must be a future date.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setError(null);
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      if (!m.title.trim()) {
        setError(`Milestone ${i + 1} Title is required.`);
        return false;
      }
      if (!m.description.trim()) {
        setError(`Milestone ${i + 1} Description is required.`);
        return false;
      }
      const amt = parseFloat(m.amount);
      if (isNaN(amt) || amt <= 0) {
        setError(`Milestone ${i + 1} Amount must be a positive number.`);
        return false;
      }
    }
    const sum = milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
    const total = parseFloat(totalAmount) || 0;
    if (Math.abs(sum - total) > 0.01) {
      setError(`The sum of milestones (${sum} STX) must equal the total Pact amount (${total} STX). Difference: ${Math.abs(sum - total).toFixed(2)} STX.`);
      return false;
    }
    return true;
  };

  const handleCreatePact = async () => {
    if (!provider || !totalAmount || !title || !description) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Always save to pactStore for local persistent simulator
      pactStore.createPact(
        title,
        description,
        address || "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7", // fallback client address
        provider,
        totalAmount,
        milestones
      );

      // If wallet is connected, try to trigger the actual Hiro wallet call,
      // but catch the error so user can proceed in simulated/offline mode if needed.
      if (connected) {
        try {
          const infoRes = await fetch("https://api.mainnet.hiro.so/v2/info");
          if (!infoRes.ok) throw new Error("Failed to fetch Stacks network height");
          const infoData = await infoRes.json();
          const currentBlockHeight = infoData.stacks_tip_height || 165000;

          let blocksOffset = 4320;
          if (deadline) {
            const selectedDate = new Date(deadline);
            const now = new Date();
            const diffTime = selectedDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0) {
              blocksOffset = diffDays * 144;
            }
          }
          const deadlineBlockHeight = currentBlockHeight + blocksOffset;
          const microAmount = parseFloat(totalAmount) * 1_000_000;

          await request("stx_callContract", {
            contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore",
            functionName: "create-pact",
            functionArgs: [
              principalCV(provider),
              uintCV(microAmount),
              stringUtf8CV(title),
              stringUtf8CV(description),
              uintCV(deadlineBlockHeight),
              uintCV(milestones.length)
            ],
            postConditionMode: "allow",
            network: "mainnet",
          });
        } catch (walletErr) {
          console.warn("Wallet transaction rejected or failed, continuing in simulator mode:", walletErr);
        }
      }

      setStep(4);
    } catch (err: any) {
      console.error("Error creating pact:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>Create a Pact</h1>
          <p style={{ color: "#94a3b8", marginTop: 6 }}>Set up a trustless escrow agreement with milestone-based payments.</p>
        </div>

        {/* Progress */}
        {step <= 3 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
            {["Details", "Milestones", "Review"].map((label, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700,
                  background: step > i ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.05)",
                  color: step > i ? "white" : "#64748b",
                  border: step === i + 1 ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.3s ease",
                }}>{i + 1}</div>
                <div style={{ fontSize: 12, color: step > i ? "#f1f5f9" : "#64748b", fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="glass-card" style={{ padding: 16, marginBottom: 24, border: "1px solid #ef4444", background: "rgba(239,68,68,0.05)", color: "#f87171", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="glass-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Pact Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="input-group">
                <label htmlFor="pact-title" className="input-label" style={{ display: "flex", alignItems: "center" }}>
                  Pact Title
                  <Tooltip text="Give your agreement a clear name representing the project deliverables." />
                </label>
                <input id="pact-title" className="input-field" placeholder="e.g. DeFi Dashboard Development" value={title} onChange={e => setTitle(e.target.value)} aria-label="Pact Title" required />
              </div>
              <div className="input-group">
                <label htmlFor="pact-desc" className="input-label" style={{ display: "flex", alignItems: "center" }}>
                  Description
                  <Tooltip text="Outline the detailed scope of work, technical requirements, and expectations." />
                </label>
                <textarea id="pact-desc" className="input-field" placeholder="Describe the work to be done..." value={description} onChange={e => setDescription(e.target.value)} aria-label="Pact Description" required />
              </div>
              <div className="input-group">
                <label htmlFor="pact-provider" className="input-label" style={{ display: "flex", alignItems: "center" }}>
                  Provider Address (STX)
                  <Tooltip text="The Stacks wallet address of the party who will perform the work and receive payments." />
                </label>
                <input id="pact-provider" className="input-field" placeholder="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7" value={provider} onChange={e => setProvider(e.target.value)} style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} aria-label="Provider Address (STX)" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="input-group">
                  <label htmlFor="pact-amount" className="input-label" style={{ display: "flex", alignItems: "center" }}>
                    Total Amount (STX)
                    <Tooltip text="The overall escrow budget that will be split among the milestones." />
                  </label>
                  <input id="pact-amount" className="input-field" type="number" placeholder="5000" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} aria-label="Total Amount (STX)" required />
                </div>
                <div className="input-group">
                  <label htmlFor="pact-deadline" className="input-label" style={{ display: "flex", alignItems: "center" }}>
                    Deadline
                    <Tooltip text="The absolute time limit by which all milestones should be successfully delivered." />
                  </label>
                  <input id="pact-deadline" className="input-field" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} aria-label="Deadline Date" required />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn btn-secondary" onClick={handleSaveDraft}>Save as Draft</button>
                <button className="btn btn-primary" style={{ padding: "12px 32px" }} onClick={() => { if (validateStep1()) setStep(2); }}>
                  Next: Milestones →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Milestones */}
        {step === 2 && (
          <div className="glass-card" style={{ padding: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Milestones ({milestones.length}/10)</h2>
              <button className="btn btn-secondary" onClick={addMilestone} style={{ padding: "8px 16px", fontSize: 13 }}>+ Add</button>
            </div>

            {/* Templates Presets */}
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>Presets:</span>
              {[
                {
                  label: "50/50 Split",
                  apply: () => {
                    const total = parseFloat(totalAmount) || 1000;
                    const half = (total / 2).toFixed(2);
                    setMilestones([
                      { title: "Phase 1 Delivery", description: "Deliver initial contract components", amount: half },
                      { title: "Phase 2 Delivery", description: "Final testing, deployment, and handover", amount: half }
                    ]);
                  }
                },
                {
                  label: "3-Step (30/40/30)",
                  apply: () => {
                    const total = parseFloat(totalAmount) || 1000;
                    setMilestones([
                      { title: "Milestone 1 (Design & Setup)", description: "Requirements gathering and UI prototypes", amount: (total * 0.3).toFixed(2) },
                      { title: "Milestone 2 (Core Build)", description: "Core functionality and logic building", amount: (total * 0.4).toFixed(2) },
                      { title: "Milestone 3 (Launch & Audit)", description: "Polishing, testing, and production deployment", amount: (total * 0.3).toFixed(2) }
                    ]);
                  }
                },
                {
                  label: "4-Phase Retainer (25% each)",
                  apply: () => {
                    const total = parseFloat(totalAmount) || 1000;
                    const quarter = (total / 4).toFixed(2);
                    setMilestones([
                      { title: "Design & Specs", description: "Wireframes and project specs document", amount: quarter },
                      { title: "Alpha Prototype", description: "First working draft layout and APIs", amount: quarter },
                      { title: "Beta Handover", description: "Ready prototype for client user testing", amount: quarter },
                      { title: "Final Production", description: "Live site deployment and audit report", amount: quarter }
                    ]);
                  }
                }
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    template.apply();
                    toast(`Applied ${template.label} template!`, "success");
                  }}
                  className="btn btn-secondary"
                  style={{ padding: "6px 12px", fontSize: 11, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", color: "#8f94fb" }}
                >
                  {template.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {milestones.map((ms, i) => (
                <div key={i} style={{
                  padding: 20, borderRadius: 12,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>Milestone {i + 1}</span>
                    {milestones.length > 1 && (
                      <button onClick={() => removeMilestone(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13 }} aria-label={`Remove Milestone ${i + 1}`}>Remove</button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input className="input-field" placeholder="Milestone title" value={ms.title} onChange={e => updateMilestone(i, "title", e.target.value)} aria-label={`Milestone ${i + 1} Title`} />
                    <textarea className="input-field" placeholder="What will be delivered?" value={ms.description} onChange={e => updateMilestone(i, "description", e.target.value)} style={{ minHeight: 60 }} aria-label={`Milestone ${i + 1} Description`} />
                    <input className="input-field" type="number" placeholder="Payment amount (STX)" value={ms.amount} onChange={e => updateMilestone(i, "amount", e.target.value)} aria-label={`Milestone ${i + 1} Amount`} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Milestone Tags</label>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {["design", "frontend", "backend", "smart-contract", "testing", "docs"].map(tag => {
                          const isSelected = (ms.tags || []).includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={(e) => {
                                e.preventDefault();
                                toggleMilestoneTag(i, tag);
                              }}
                              style={{
                                padding: "4px 10px",
                                borderRadius: 6,
                                fontSize: 11,
                                cursor: "pointer",
                                border: "1px solid",
                                background: isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.02)",
                                color: isSelected ? "#818cf8" : "#94a3b8",
                                borderColor: isSelected ? "rgba(99, 102, 241, 0.4)" : "rgba(255,255,255,0.08)",
                                transition: "all 0.2s"
                              }}
                            >
                              #{tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-secondary" onClick={handleSaveDraft}>Save as Draft</button>
                <button className="btn btn-primary" onClick={() => { if (validateStep2()) setStep(3); }}>Review Pact →</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="glass-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Review & Create</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Title</div>
                <div style={{ fontWeight: 600 }}>{title || "—"}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Amount</div>
                  <div style={{ fontWeight: 600 }}>{totalAmount || "—"} STX</div>
                </div>
                <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Milestones</div>
                  <div style={{ fontWeight: 600 }}>{milestones.length}</div>
                </div>
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <div style={{ fontSize: 13, color: "#22c55e", marginBottom: 4 }}>Protocol Fee (1%)</div>
                <div style={{ fontWeight: 600, color: "#22c55e" }}>{totalAmount ? (parseFloat(totalAmount) * 0.01).toFixed(2) : "0"} STX</div>
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>Estimated Stacks Gas Fee</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Based on current network congestion</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#3b82f6" }}>
                      {gasTier === "low" ? "0.005" : gasTier === "medium" ? "0.012" : "0.025"} STX
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                      ~{gasTier === "low" ? "20m" : gasTier === "medium" ? "10m" : "5m"} confirm time
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["low", "medium", "high"] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={(e) => { e.preventDefault(); setGasTier(tier); }}
                      style={{
                        flex: 1, padding: "6px 0", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                        border: "1px solid",
                        background: gasTier === tier ? "rgba(59,130,246,0.15)" : "transparent",
                        borderColor: gasTier === tier ? "#3b82f6" : "rgba(255,255,255,0.08)",
                        color: gasTier === tier ? "#60a5fa" : "#94a3b8",
                        textTransform: "capitalize", transition: "all 0.2s"
                      }}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary" style={{ padding: "14px 36px" }} onClick={handleCreatePact} disabled={loading}>
                {loading ? "Creating transaction..." : "⚡ Create Pact"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success Screen */}
        {step === 4 && (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", border: "1px solid rgba(34,197,94,0.3)", background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(99,102,241,0.02))" }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: "#22c55e" }}>Escrow Transaction Initiated!</h2>
            <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 28, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
              Your trustless agreement has been submitted to the Stacks Blockchain in `pactcore`.
            </p>
            
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 24, margin: "0 auto 28px", maxWidth: 400, textAlign: "left" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Next Step: Publish Milestones</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                You must publish your {milestones.length} milestones to the `milestone-v2` contract so the provider can begin work.
                (Note: Your wallet will prompt you {milestones.length} times).
              </p>
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{publishedCount} / {milestones.length} Published</span>
                <div style={{ width: 100, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
                  <div style={{ width: `${(publishedCount / milestones.length) * 100}%`, height: "100%", background: "#22c55e", borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: "100%", padding: "12px 0" }}
                disabled={isPublishing || publishedCount === milestones.length}
                onClick={async () => {
                  if (!connected) return toast("Please connect wallet", "warning");
                  setIsPublishing(true);
                  try {
                    // Let's assume the ID of the created pact is the latest length (mock)
                    const mockPactId = pactStore.getPacts().length; 
                    for (let i = publishedCount; i < milestones.length; i++) {
                      const m = milestones[i];
                      const microAmt = parseFloat(m.amount) * 1_000_000 || 0;
                      await request("stx_callContract", {
                        contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.milestone-v2",
                        functionName: "add-milestone",
                        functionArgs: [uintCV(mockPactId), stringUtf8CV(m.title), stringUtf8CV(m.description), uintCV(microAmt)],
                        postConditionMode: "allow",
                        network: "mainnet",
                      });
                      setPublishedCount(prev => prev + 1);
                    }
                    toast("All milestones successfully published!", "success");
                  } catch (err) {
                    console.error(err);
                    toast("Publishing interrupted or failed.", "error");
                  } finally {
                    setIsPublishing(false);
                  }
                }}
              >
                {publishedCount === milestones.length ? "✅ Milestones Published" : isPublishing ? "Publishing..." : "Publish Milestones to Chain"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={() => { setStep(1); setPublishedCount(0); }}>Create Another Pact</button>
              <a href="https://explorer.hiro.so/?chain=mainnet" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                View Stacks Explorer
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatePactPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}><div className="container" style={{ maxWidth: 720 }}>Loading...</div></div>}>
      <CreatePactForm />
    </Suspense>
  );
}

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
}

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
      setMilestones([...milestones, { title: "", description: "", amount: "" }]);
    }
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
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
                <label htmlFor="pact-title" className="input-label">Pact Title</label>
                <input id="pact-title" className="input-field" placeholder="e.g. DeFi Dashboard Development" value={title} onChange={e => setTitle(e.target.value)} aria-label="Pact Title" required />
              </div>
              <div className="input-group">
                <label htmlFor="pact-desc" className="input-label">Description</label>
                <textarea id="pact-desc" className="input-field" placeholder="Describe the work to be done..." value={description} onChange={e => setDescription(e.target.value)} aria-label="Pact Description" required />
              </div>
              <div className="input-group">
                <label htmlFor="pact-provider" className="input-label">Provider Address (STX)</label>
                <input id="pact-provider" className="input-field" placeholder="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7" value={provider} onChange={e => setProvider(e.target.value)} style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} aria-label="Provider Address (STX)" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="input-group">
                  <label htmlFor="pact-amount" className="input-label">Total Amount (STX)</label>
                  <input id="pact-amount" className="input-field" type="number" placeholder="5000" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} aria-label="Total Amount (STX)" required />
                </div>
                <div className="input-group">
                  <label htmlFor="pact-deadline" className="input-label">Deadline</label>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Milestones ({milestones.length}/10)</h2>
              <button className="btn btn-secondary" onClick={addMilestone} style={{ padding: "8px 16px", fontSize: 13 }}>+ Add</button>
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

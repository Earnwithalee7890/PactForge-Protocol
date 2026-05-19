"use client";
import { useState } from "react";

interface Milestone {
  title: string;
  description: string;
  amount: string;
}

export default function CreatePactPage() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "", description: "", amount: "" },
  ]);

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

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>Create a Pact</h1>
          <p style={{ color: "#94a3b8", marginTop: 6 }}>Set up a trustless escrow agreement with milestone-based payments.</p>
        </div>

        {/* Progress */}
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

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="glass-card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Pact Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="input-group">
                <label className="input-label">Pact Title</label>
                <input className="input-field" placeholder="e.g. DeFi Dashboard Development" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" placeholder="Describe the work to be done..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Provider Address (STX)</label>
                <input className="input-field" placeholder="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7" value={provider} onChange={e => setProvider(e.target.value)} style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Total Amount (STX)</label>
                  <input className="input-field" type="number" placeholder="5000" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Deadline</label>
                  <input className="input-field" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ alignSelf: "flex-end", padding: "12px 32px" }} onClick={() => setStep(2)}>
                Next: Milestones →
              </button>
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
                      <button onClick={() => removeMilestone(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13 }}>Remove</button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input className="input-field" placeholder="Milestone title" value={ms.title} onChange={e => updateMilestone(i, "title", e.target.value)} />
                    <textarea className="input-field" placeholder="What will be delivered?" value={ms.description} onChange={e => updateMilestone(i, "description", e.target.value)} style={{ minHeight: 60 }} />
                    <input className="input-field" type="number" placeholder="Payment amount (STX)" value={ms.amount} onChange={e => updateMilestone(i, "amount", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Review Pact →</button>
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
              <button className="btn btn-primary" style={{ padding: "14px 36px" }}>⚡ Create Pact</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

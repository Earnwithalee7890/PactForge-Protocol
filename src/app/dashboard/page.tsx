"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { pactStore } from "@/lib/pactStore";
import { Pact } from "@/lib/types";
import SkeletonLoader from "@/components/SkeletonLoader";
import PayoutChart from "@/components/PayoutChart";
import { useToast } from "@/components/Toaster";
import { request } from "@stacks/connect";
import { uintCV } from "@stacks/transactions";
import { useWallet } from "@/context/WalletContext";

const stateColors: Record<string, { bg: string; color: string }> = {
  draft: { bg: "rgba(100,116,139,0.12)", color: "#64748b" },
  created: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
  funded: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  active: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  completed: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  disputed: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#b91c1c" },
};

export default function DashboardPage() {
  const [pacts, setPacts] = useState<Pact[]>([]);
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"deadline" | "amount" | "default">("default");
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { connected } = useWallet();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setPacts(pactStore.getPacts());
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = pacts.filter(p => {
    if (tab !== "all" && p.state !== tab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!(p.title || "").toLowerCase().includes(q) && !(p.provider || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "amount") {
      const amountA = parseInt((a.totalAmount || "").replace(/[^0-9]/g, '')) || 0;
      const amountB = parseInt((b.totalAmount || "").replace(/[^0-9]/g, '')) || 0;
      return amountB - amountA;
    }
    if (sortBy === "deadline") {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });

  const exportCSV = () => {
    const headers = ["ID", "Title", "Provider", "Amount", "Milestones", "Completed", "State", "Deadline"];
    const csvContent = [
      headers.join(","),
      ...filtered.map(p => {
        const total = p.milestones?.length || 0;
        const completed = (p.milestones || []).filter(m => m.state >= 3).length;
        return `${p.id},"${p.title || ""}","${p.provider || ""}","${p.totalAmount || ""}",${total},${completed},${p.state},"${p.deadline || ""}"`;
      })
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pacts_export.csv";
    link.click();
  };

  const handleFundPact = async (e: React.MouseEvent, pactId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const pact = pactStore.getPactById(pactId);
    if (!pact) return;
    if (!connected) {
      toast("Please connect your Stacks wallet.", "warning");
      return;
    }
    try {
      const microAmount = parseFloat((pact.totalAmount || "0").replace(/[^0-9.]/g, "")) * 1_000_000 || 0;
      await request("stx_callContract", {
        contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactforge-core",
        functionName: "fund-pact",
        functionArgs: [uintCV(pact.id), uintCV(microAmount)],
        postConditionMode: "allow",
        network: "mainnet",
      });

      pact.state = 'active';
      pact.fundedAmount = pact.totalAmount;
      if (pact.milestones && pact.milestones.length > 0) pact.milestones[0].state = 1;
      pactStore.updatePact(pact);
      setPacts(pactStore.getPacts());
      toast("Transaction broadcasted! Pact funded.", "success");
    } catch (err) {
      console.error(err);
      toast("Transaction cancelled or failed.", "error");
    }
  };

  const handleCompleteNext = async (e: React.MouseEvent, pact: Pact) => {
    e.preventDefault();
    e.stopPropagation();
    if (!connected) {
      toast("Please connect your Stacks wallet.", "warning");
      return;
    }
    const nextMilestone = (pact.milestones || []).find(m => m.state < 3);
    if (nextMilestone) {
      try {
        await request("stx_callContract", {
          contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactforge-core",
          functionName: "approve-milestone",
          functionArgs: [uintCV(pact.id), uintCV(nextMilestone.id)],
          postConditionMode: "allow",
          network: "mainnet",
        });
        pactStore.updateMilestoneState(pact.id, nextMilestone.id, 5);
        setPacts(pactStore.getPacts());
        toast("Transaction broadcasted! Simulated locally.", "success");
      } catch (err) {
        console.error(err);
        toast("Transaction cancelled or failed.", "error");
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 60 }}>
      <div className="container">
        <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>Dashboard</h1>
            <p style={{ color: "#94a3b8", marginTop: 6 }}>Manage your pacts, track milestones, and monitor earnings.</p>
          </div>
          <button onClick={exportCSV} className="btn btn-secondary" style={{ padding: "8px 20px", fontSize: 13 }}>
            Export CSV
          </button>
        </div>

        {/* Stats Row */}
        {loading ? (
          <div style={{ marginBottom: 40 }}><SkeletonLoader count={4} type="stat" /></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
            {[
              { label: "Active Pacts", value: pacts.filter(p => p.state === "active").length.toString(), icon: "📋" },
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
        )}

        {/* Payouts Chart */}
        {!loading && <PayoutChart />}

        {/* Toolbar: Tabs, Search, Sort */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "draft", "active", "completed"] as const).map(t => (
              <button key={t} onClick={() => setTab(t as any)}
                className={tab === t ? "btn btn-primary" : "btn btn-secondary"}
                style={{ padding: "8px 20px", fontSize: 13, textTransform: "capitalize" }}>
                {t === "all" ? "All Pacts" : t}
              </button>
            ))}
          </div>
          
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input 
              type="text" 
              placeholder="Search pacts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 16px",
                color: "#f1f5f9",
                fontSize: 13,
                outline: "none",
                minWidth: 200
              }}
            />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 16px",
                color: "#f1f5f9",
                fontSize: 13,
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="default" style={{ background: "#0f172a" }}>Sort by: Default</option>
              <option value="amount" style={{ background: "#0f172a" }}>Sort by: Amount</option>
              <option value="deadline" style={{ background: "#0f172a" }}>Sort by: Deadline</option>
            </select>
          </div>
        </div>

        {/* Pacts List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <SkeletonLoader count={4} type="row" />
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "rgba(255,255,255,0.02)", borderRadius: 16 }}>
              No pacts found matching your criteria.
            </div>
          ) : filtered.map(p => {
            const total = p.milestones?.length || 0;
            const completed = (p.milestones || []).filter(m => m.state >= 3).length;
            const pct = total > 0 ? (completed / total) * 100 : 0;
            const hasNext = (p.milestones || []).some(m => m.state < 3);
            const linkHref = p.state === "draft" ? `/create-pact?id=${p.id}` : `/pacts?id=${p.id}`;
            return (
              <Link key={p.id} href={linkHref} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="glass-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.title || "Untitled"}</div>
                    <div style={{ fontSize: 13, color: "#64748b", fontFamily: "var(--font-mono)" }}>Provider: {p.provider || "Not Set"}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 100 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{p.totalAmount || "0 STX"}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Value</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 100 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{completed}/{total}</div>
                    <div style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 6 }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Milestones</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 80 }}>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{p.deadline}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {p.state === 'created' && (
                      <button onClick={e => handleFundPact(e, p.id)} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 11 }}>
                        ⚡ Fund Pact
                      </button>
                    )}
                    {p.state === 'active' && hasNext && (
                      <button onClick={e => handleCompleteNext(e, p)} className="btn btn-success" style={{ padding: "6px 12px", fontSize: 11 }}>
                        ✅ Complete MS
                      </button>
                    )}
                    <div style={{
                      padding: "4px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: stateColors[p.state]?.bg, color: stateColors[p.state]?.color,
                      textTransform: "capitalize",
                    }}>{p.state}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

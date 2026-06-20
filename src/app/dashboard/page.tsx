"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { pactStore } from "@/lib/pactStore";
import { Pact } from "@/lib/types";
import SkeletonLoader from "@/components/SkeletonLoader";
import PayoutChart from "@/components/PayoutChart";
import StatsBreakdown from "@/components/StatsBreakdown";
import { useToast } from "@/components/Toaster";
import { request } from "@stacks/connect";
import { uintCV } from "@stacks/transactions";
import { useWallet } from "@/context/WalletContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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
  const [tab, setTab] = useState<"all" | "active" | "completed" | "draft" | "settings">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"deadline" | "amount" | "default">("default");
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<"STX" | "USD" | "EUR">("STX");

  // Settings states using custom useLocalStorage hook
  const [emailNotif, setEmailNotif] = useLocalStorage<boolean>("pactforge_settings_email", true);
  const [autoSync, setAutoSync] = useLocalStorage<boolean>("pactforge_settings_sync", true);
  const [selectedNetwork, setSelectedNetwork] = useLocalStorage<"mainnet" | "testnet" | "mock">("pactforge_settings_network", "mainnet");
  const [customNodeUrl, setCustomNodeUrl] = useLocalStorage<string>("pactforge_settings_node", "https://api.mainnet.hiro.so");
  const [autoRefreshInterval, setAutoRefreshInterval] = useLocalStorage<number>("pactforge_settings_interval", 30);
  const [walletAlerts, setWalletAlerts] = useLocalStorage<boolean>("pactforge_settings_alerts", true);
  const [simulatedActivity, setSimulatedActivity] = useLocalStorage<boolean>("pactforge_settings_simulation", false);

  const { toast } = useToast();
  const { connected } = useWallet();

  useEffect(() => {
    const saved = localStorage.getItem("pactforge_v2_currency");
    if (saved && (saved === "STX" || saved === "USD" || saved === "EUR")) {
      setCurrency(saved as any);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setPacts(pactStore.getPacts());
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);  useEffect(() => {
    if (!simulatedActivity) return;
    const interval = setInterval(() => {
      const currentPacts = pactStore.getPacts();
      const progressable = currentPacts.find(p => p.state === "created" || (p.state === "active" && (p.milestones || []).some(m => m.state < 3)));
      if (progressable) {
        if (progressable.state === "created") {
          progressable.state = "active";
          progressable.fundedAmount = progressable.totalAmount;
          if (progressable.milestones && progressable.milestones.length > 0) {
            progressable.milestones[0].state = 1;
          }
          pactStore.updatePact(progressable);
          setPacts(pactStore.getPacts());
          toast(`[Simulation] Funded Pact #${progressable.id}: ${progressable.title}`, "info");
        } else {
          const nextM = (progressable.milestones || []).find(m => m.state < 3);
          if (nextM) {
            const nextState = (nextM.state === 1 ? 3 : 1) as any;
            pactStore.updateMilestoneState(progressable.id, nextM.id, nextState);
            setPacts(pactStore.getPacts());
            toast(`[Simulation] Milestone '${nextM.title}' on Pact #${progressable.id} progressed!`, "info");
          }
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [simulatedActivity, toast]);


  const filtered = useMemo(() => {
    if (tab === "settings") return [];
    return pacts.filter(p => {
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
  }, [pacts, tab, searchQuery, sortBy]);

  const dashboardStats = useMemo(() => {
    const activeCount = pacts.filter(p => p.state === "active").length;
    // Calculate total earned from completed pacts
    const totalEarnedSTX = pacts
      .filter(p => p.state === "completed")
      .reduce((sum, p) => {
        const amount = parseInt((p.totalAmount || "").replace(/[^0-9]/g, '')) || 0;
        return sum + amount;
      }, 0);
    const earnedVal = totalEarnedSTX > 0 ? `${totalEarnedSTX.toLocaleString()} STX` : "0 STX";

    // completion rate calculation
    const completedCount = pacts.filter(p => p.state === "completed").length;
    const closedCount = pacts.filter(p => p.state === "completed" || p.state === "cancelled").length;
    const rate = closedCount > 0 ? `${Math.round((completedCount / closedCount) * 100)}%` : "100%";

    return [
      { label: "Active Pacts", value: activeCount.toString(), icon: "📋" },
      { label: "Total Earned", value: earnedVal, icon: "💰" },
      { label: "Reputation Score", value: "95", icon: "⭐" },
      { label: "Completion Rate", value: rate, icon: "✅" },
    ];
  }, [pacts]);

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
      await request("stx_callContract", {
        contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore",
        functionName: "fund-pact",
        functionArgs: [uintCV(pact.id)],
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
          contract: "SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.milestone-v2",
          functionName: "approve-milestone",
          functionArgs: [uintCV(nextMilestone.id)],
          postConditionMode: "allow",
          network: "mainnet",
        });
        pactStore.updateMilestoneState(pact.id, nextMilestone.id, 3);
        setPacts(pactStore.getPacts());
        toast("Milestone approved! Release funds in details view.", "success");
      } catch (err) {
        console.error(err);
        toast("Transaction cancelled or failed.", "error");
      }
    }
  };

  const handleSaveSettings = () => {
    toast("Settings saved successfully!", "success");
  };

  const handleExportData = () => {
    const data = {
      pacts: pactStore.getPacts(),
      currency,
      settings: {
        emailNotif,
        autoSync,
        selectedNetwork,
        customNodeUrl,
        autoRefreshInterval,
        walletAlerts,
        simulatedActivity
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pactforge_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    toast("Backup configuration file downloaded!", "success");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.pacts && Array.isArray(parsed.pacts)) {
          localStorage.setItem("pactforge_v2_pacts", JSON.stringify(parsed.pacts));
          setPacts(parsed.pacts);
          if (parsed.settings) {
            if (parsed.settings.emailNotif !== undefined) setEmailNotif(parsed.settings.emailNotif);
            if (parsed.settings.autoSync !== undefined) setAutoSync(parsed.settings.autoSync);
            if (parsed.settings.selectedNetwork !== undefined) setSelectedNetwork(parsed.settings.selectedNetwork);
            if (parsed.settings.customNodeUrl !== undefined) setCustomNodeUrl(parsed.settings.customNodeUrl);
            if (parsed.settings.autoRefreshInterval !== undefined) setAutoRefreshInterval(parsed.settings.autoRefreshInterval);
            if (parsed.settings.walletAlerts !== undefined) setWalletAlerts(parsed.settings.walletAlerts);
            if (parsed.settings.simulatedActivity !== undefined) setSimulatedActivity(parsed.settings.simulatedActivity);
          }
          toast("Database restored from backup successfully!", "success");
        } else {
          toast("Invalid backup file format.", "error");
        }
      } catch (err) {
        console.error(err);
        toast("Failed to parse backup file.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleResetStore = () => {
    if (confirm("Are you sure you want to reset all mock pacts and reputation stats? This will restore clean mock database states.")) {
      pactStore.clearAll();
      setPacts(pactStore.getPacts());
      toast("Mock application state reset successfully!", "success");
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
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Currency Pill Selector */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 3, borderRadius: 10 }}>
              {(["STX", "USD", "EUR"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    setCurrency(curr);
                    localStorage.setItem("pactforge_v2_currency", curr);
                    toast(`Display currency set to ${curr}`, "info");
                  }}
                  style={{
                    background: currency === curr ? "rgba(99,102,241,0.15)" : "transparent",
                    border: "none",
                    borderRadius: 8,
                    color: currency === curr ? "var(--text-primary)" : "var(--text-muted)",
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button onClick={handleResetStore} className="btn btn-danger" style={{ padding: "8px 20px", fontSize: 13, background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              🔄 Reset State
            </button>
            <button onClick={exportCSV} className="btn btn-secondary" style={{ padding: "8px 20px", fontSize: 13 }}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {tab !== "settings" && (loading ? (
          <div style={{ marginBottom: 40 }}><SkeletonLoader count={4} type="stat" /></div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
              {dashboardStats.map((s, i) => (
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
            <StatsBreakdown pacts={pacts} currency={currency} />
          </>
        ))}

        {/* Payouts Chart */}
        {!loading && tab !== "settings" && <PayoutChart />}

        {/* Toolbar: Tabs, Search, Sort */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "draft", "active", "completed", "settings"] as const).map(t => (
              <button key={t} onClick={() => setTab(t as any)}
                className={tab === t ? "btn btn-primary" : "btn btn-secondary"}
                style={{ padding: "8px 20px", fontSize: 13, textTransform: "capitalize" }}>
                {t === "all" ? "All Pacts" : t === "settings" ? "⚙️ Settings" : t}
              </button>
            ))}
          </div>
          
          {tab !== "settings" && (
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
          )}
        </div>

        {/* Pacts List or Settings Panel */}
        {tab === "settings" ? (
          <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Configuration Panel</h2>
              <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                Adjust blockchain API nodes, toggle notification behaviors, and manage local storage backups.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
              {/* Category 1: Network Preferences */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>🌐 Network Settings</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8" }}>Target Network</label>
                  <select 
                    value={selectedNetwork} 
                    onChange={(e) => setSelectedNetwork(e.target.value as any)}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#f1f5f9",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="mainnet" style={{ background: "#0f172a" }}>Mainnet</option>
                    <option value="testnet" style={{ background: "#0f172a" }}>Testnet</option>
                    <option value="mock" style={{ background: "#0f172a" }}>Mocknet / Devnet</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8" }}>Stacks Node API URL</label>
                  <input 
                    type="text" 
                    value={customNodeUrl}
                    onChange={(e) => setCustomNodeUrl(e.target.value)}
                    placeholder="https://api.mainnet.hiro.so"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#f1f5f9",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                    <span 
                      onClick={() => setCustomNodeUrl("https://api.mainnet.hiro.so")}
                      style={{ fontSize: 11, color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Hiro Mainnet
                    </span>
                    <span 
                      onClick={() => {
                        navigator.clipboard.writeText("https://api.mainnet.hiro.so");
                        toast("Hiro Mainnet node URL copied to clipboard!", "success");
                      }}
                      style={{ fontSize: 10, color: "#94a3b8", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 2 }}
                      title="Copy URL"
                    >
                      📋 Copy
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>|</span>
                    <span 
                      onClick={() => setCustomNodeUrl("https://api.testnet.hiro.so")}
                      style={{ fontSize: 11, color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Hiro Testnet
                    </span>
                    <span 
                      onClick={() => {
                        navigator.clipboard.writeText("https://api.testnet.hiro.so");
                        toast("Hiro Testnet node URL copied to clipboard!", "success");
                      }}
                      style={{ fontSize: 10, color: "#94a3b8", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 2 }}
                      title="Copy URL"
                    >
                      📋 Copy
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 2: Notification & Alerts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>🔔 Notifications & Polling</h3>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Email Digests</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Receive weekly milestone completion logs.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailNotif}
                    onChange={(e) => setEmailNotif(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#6366f1" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Live Wallet Alerts</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Pop up system toasts on contract events.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={walletAlerts}
                    onChange={(e) => setWalletAlerts(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#6366f1" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Simulate Contract Activity</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Periodically auto-progress mock pact milestones.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={simulatedActivity}
                    onChange={(e) => setSimulatedActivity(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#6366f1" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Decentralized Auto-Sync</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Auto fetch new escrow data on app startup.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#6366f1" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8" }}>Auto-Refresh Polling Interval</label>
                  <select 
                    value={autoRefreshInterval} 
                    onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value) || 30)}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#f1f5f9",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="15" style={{ background: "#0f172a" }}>Every 15 seconds</option>
                    <option value="30" style={{ background: "#0f172a" }}>Every 30 seconds</option>
                    <option value="60" style={{ background: "#0f172a" }}>Every 60 seconds</option>
                    <option value="120" style={{ background: "#0f172a" }}>Every 2 minutes</option>
                  </select>
                </div>
              </div>

              {/* Category 3: Active Smart Contracts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>📜 Contract Deployments</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Pact Core</div>
                    <div style={{ fontSize: 12, wordBreak: "break-all", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore
                    </div>
                    <a 
                      href="https://explorer.hiro.so/txid/SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore?chain=mainnet" 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ fontSize: 11, color: "#6366f1", textDecoration: "none", display: "inline-block", marginTop: 4 }}
                    >
                      View on Explorer ↗
                    </a>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Milestone SBT</div>
                    <div style={{ fontSize: 12, wordBreak: "break-all", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.milestone-v2
                    </div>
                    <a 
                      href="https://explorer.hiro.so/txid/SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.milestone-v2?chain=mainnet" 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ fontSize: 11, color: "#6366f1", textDecoration: "none", display: "inline-block", marginTop: 4 }}
                    >
                      View on Explorer ↗
                    </a>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Reputation SBT</div>
                    <div style={{ fontSize: 12, wordBreak: "break-all", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.reputation-sbt-v2
                    </div>
                    <a 
                      href="https://explorer.hiro.so/txid/SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.reputation-sbt-v2?chain=mainnet" 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ fontSize: 11, color: "#6366f1", textDecoration: "none", display: "inline-block", marginTop: 4 }}
                    >
                      View on Explorer ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Category 4: Data Portability */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>💾 Backup & Diagnostics</h3>
                
                <p style={{ fontSize: 12, color: "#64748b", lineHeight: "1.5" }}>
                  Export your current database state to back up configuration. You can also import a previous backup file to restore pact statuses and credentials.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button 
                    onClick={handleExportData} 
                    className="btn btn-secondary" 
                    style={{ padding: "10px 16px", fontSize: 13, width: "100%", textAlign: "center" }}
                  >
                    📥 Export Backup JSON
                  </button>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, color: "#94a3b8" }}>Import Backup File</label>
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={handleImportData}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        padding: "6px 12px",
                        color: "#94a3b8",
                        fontSize: 12,
                        cursor: "pointer"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Buttons Footer */}
            <div style={{ display: "flex", gap: 12, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, justifyContent: "flex-end" }}>
              <button 
                onClick={() => setTab("all")} 
                className="btn btn-secondary" 
                style={{ padding: "10px 24px", fontSize: 13 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings} 
                className="btn btn-primary" 
                style={{ padding: "10px 28px", fontSize: 13 }}
              >
                Save Settings
              </button>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

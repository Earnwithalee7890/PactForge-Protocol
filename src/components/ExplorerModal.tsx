"use client";
import React, { useState, useEffect } from "react";

interface ExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAddress: string;
}

export default function ExplorerModal({ isOpen, onClose, targetAddress }: ExplorerModalProps) {
  const [address, setAddress] = useState(targetAddress);
  const [stxBalance, setStxBalance] = useState<number | null>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetAddress) {
      setAddress(targetAddress);
    }
  }, [targetAddress]);

  useEffect(() => {
    if (!isOpen || !address) return;

    const fetchBlockchainData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Balances
        const balRes = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${address}/balances`);
        if (!balRes.ok) throw new Error("Failed to fetch address balance.");
        const balData = await balRes.json();
        const microStx = parseInt(balData.stx?.balance || "0");
        setStxBalance(microStx / 1_000_000);

        // Fetch Transactions
        const txRes = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${address}/transactions?limit=5`);
        if (!txRes.ok) throw new Error("Failed to fetch transaction logs.");
        const txData = await txRes.json();
        setRecentTx(txData.results || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainData();
  }, [isOpen, address]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(10, 11, 15, 0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
      padding: 16
    }}>
      <div className="glass-card" style={{
        width: "100%", maxWidth: 520, padding: 28,
        background: "rgba(18, 19, 26, 0.95)", border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.5)", borderRadius: 16
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>🔍 Stacks On-Chain Explorer</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#64748b",
            fontSize: 20, cursor: "pointer", padding: 4
          }} onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>Search Wallet Address</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              className="input-field"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="SP..."
              style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            Retrieving live mainnet data...
          </div>
        ) : error ? (
          <div style={{ padding: 16, background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 8, color: "#ef4444", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        ) : (
          <div>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Account Balance</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>
                {stxBalance !== null ? `${stxBalance.toLocaleString()} STX` : "0 STX"}
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>Recent Transactions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", marginBottom: 20 }}>
              {recentTx.length === 0 ? (
                <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>No recent transactions.</div>
              ) : recentTx.map((tx, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9" }}>
                      {tx.tx_type === "contract_call" ? `Call: ${tx.contract_call?.function_name}` : tx.tx_type}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "var(--font-mono)", marginTop: 2 }}>{tx.tx_id.slice(0, 16)}...</div>
                  </div>
                  <a href={`https://explorer.hiro.so/txid/${tx.tx_id}?chain=mainnet`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#6366f1" }}>
                    View ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <a
            href={`https://explorer.hiro.so/address/${address}?chain=mainnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: "8px 16px", fontSize: 12 }}
          >
            Full Hiro Explorer ↗
          </a>
        </div>
      </div>
    </div>
  );
}

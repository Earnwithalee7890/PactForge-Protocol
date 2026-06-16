"use client";
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("PactForge Protocol Error Boundary caught:", error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: 96 }}>
      <div className="glass-card" style={{ padding: 60, textAlign: "center", maxWidth: 600, width: "100%", border: "1px solid rgba(239,68,68,0.3)" }}>
        <h1 style={{ fontSize: 80, fontWeight: 900, marginBottom: 10, color: "#ef4444" }}>Oops!</h1>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Something went wrong</h2>
        <p style={{ color: "#94a3b8", marginBottom: 40, fontSize: 16 }}>An unexpected protocol error occurred. This could be due to a network glitch or a misconfigured transaction. Please try again or return to your dashboard.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button className="btn btn-secondary" onClick={() => reset()} style={{ padding: "14px 32px" }}>Try Again</button>
          <Link href="/dashboard" className="btn btn-primary" style={{ padding: "14px 32px" }}>Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

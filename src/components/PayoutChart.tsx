import { useState } from "react";

export default function PayoutChart() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const config = {
    weekly: {
      points: "0,140 50,130 100,100 150,90 200,60 250,50 300,20 300,150 0,150",
      linePoints: "0,140 50,130 100,100 150,90 200,60 250,50 300,20",
      circles: [
        { cx: 0, cy: 140 },
        { cx: 50, cy: 130 },
        { cx: 100, cy: 100 },
        { cx: 150, cy: 90 },
        { cx: 200, cy: 60 },
        { cx: 250, cy: 50 },
        { cx: 300, cy: 20 }
      ],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      growth: "+12%",
      subtitle: "Total STX released over the last 7 days",
    },
    monthly: {
      points: "0,120 40,90 80,100 120,60 160,80 200,30 240,40 280,10 300,10 300,150 0,150",
      linePoints: "0,120 40,90 80,100 120,60 160,80 200,30 240,40 280,10 300,10",
      circles: [
        { cx: 0, cy: 120 },
        { cx: 40, cy: 90 },
        { cx: 80, cy: 100 },
        { cx: 120, cy: 60 },
        { cx: 160, cy: 80 },
        { cx: 200, cy: 30 },
        { cx: 240, cy: 40 },
        { cx: 280, cy: 10 },
        { cx: 300, cy: 10 }
      ],
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      growth: "+24%",
      subtitle: "Total STX released over the last 30 days",
    },
    yearly: {
      points: "0,130 60,110 120,80 180,90 240,40 300,5 300,150 0,150",
      linePoints: "0,130 60,110 120,80 180,90 240,40 300,5",
      circles: [
        { cx: 0, cy: 130 },
        { cx: 60, cy: 110 },
        { cx: 120, cy: 80 },
        { cx: 180, cy: 90 },
        { cx: 240, cy: 40 },
        { cx: 300, cy: 5 }
      ],
      labels: ["Q1", "Q2", "Q3", "Q4"],
      growth: "+148%",
      subtitle: "Total STX released over the last 12 months",
    }
  };

  return (
    <div className="glass-card" style={{ padding: 24, marginBottom: 40, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Cumulative Payouts</h2>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{config[timeframe].subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 2, borderRadius: 8 }}>
            {(["weekly", "monthly", "yearly"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                style={{
                  background: timeframe === t ? "rgba(99,102,241,0.15)" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  color: timeframe === t ? "var(--text-primary)" : "var(--text-muted)",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.2s"
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{config[timeframe].growth}</div>
        </div>
      </div>
      
      <div style={{ position: "relative", height: 200, width: "100%" }}>
        <svg viewBox="0 0 300 150" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.0)" />
            </linearGradient>
          </defs>
          <polyline fill="url(#chartGradient)" points={config[timeframe].points} />
          <polyline fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={config[timeframe].linePoints} />
          
          {/* Data Points */}
          {config[timeframe].circles.map((c, idx) => (
            <circle key={idx} cx={c.cx} cy={c.cy} r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          ))}
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, color: "#64748b", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          {config[timeframe].labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

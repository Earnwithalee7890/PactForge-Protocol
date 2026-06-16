export default function PayoutChart() {
  const points = "0,120 40,90 80,100 120,60 160,80 200,30 240,40 280,10 300,10 300,150 0,150";
  const linePoints = "0,120 40,90 80,100 120,60 160,80 200,30 240,40 280,10 300,10";

  return (
    <div className="glass-card" style={{ padding: 24, marginBottom: 40, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Cumulative Payouts</h2>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>Total STX released over the last 30 days</div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>+24%</div>
      </div>
      
      <div style={{ position: "relative", height: 200, width: "100%" }}>
        <svg viewBox="0 0 300 150" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.0)" />
            </linearGradient>
          </defs>
          <polyline fill="url(#chartGradient)" points={points} />
          <polyline fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={linePoints} />
          
          {/* Data Points */}
          <circle cx="0" cy="120" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          <circle cx="40" cy="90" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          <circle cx="80" cy="100" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          <circle cx="120" cy="60" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          <circle cx="160" cy="80" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          <circle cx="200" cy="30" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          <circle cx="240" cy="40" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          <circle cx="280" cy="10" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
          <circle cx="300" cy="10" r="4" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, color: "#64748b", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
        </div>
      </div>
    </div>
  );
}

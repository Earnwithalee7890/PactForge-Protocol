export default function SkeletonLoader({ count = 3, type = "card" }: { count?: number, type?: "card" | "row" | "stat" | "pactDetail" }) {
  const arr = Array.from({ length: count });
  return (
    <div style={{ display: "flex", flexDirection: type === "row" || type === "pactDetail" ? "column" : "row", gap: 16, flexWrap: "wrap", width: "100%" }}>
      {arr.map((_, i) => (
        <div key={i} className="glass-card animate-pulse" style={{
          padding: 24,
          flex: type === "card" || type === "stat" ? "1 1 200px" : "1 1 100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "stretch",
          minHeight: type === "card" ? 140 : type === "stat" ? 100 : type === "pactDetail" ? 220 : 80
        }}>
          {type === "pactDetail" ? (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ width: "40%", height: 28, borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />
                <div style={{ width: 80, height: 24, borderRadius: 100, background: "rgba(255,255,255,0.05)" }} />
              </div>
              <div style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.05)" }} />
              <div style={{ display: "flex", gap: 24, width: "100%", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ width: "30%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
                  <div style={{ width: "70%", height: 16, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
                </div>
                <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ width: "30%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
                  <div style={{ width: "70%", height: 16, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
                </div>
              </div>
            </div>
          ) : type === "row" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.05)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: "60%", height: 16, borderRadius: 4, background: "rgba(255,255,255,0.05)", marginBottom: 8 }} />
                <div style={{ width: "40%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
              </div>
              <div style={{ width: 80, height: 24, borderRadius: 12, background: "rgba(255,255,255,0.05)" }} />
            </div>
          ) : (
            <>
              <div style={{ width: "80%", height: 18, borderRadius: 4, background: "rgba(255,255,255,0.05)", marginBottom: 12 }} />
              <div style={{ width: "100%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.05)", marginBottom: 8 }} />
              <div style={{ width: "60%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

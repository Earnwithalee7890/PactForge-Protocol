export default function SkeletonLoader({ count = 3, type = "card" }: { count?: number, type?: "card" | "row" | "stat" }) {
  const arr = Array.from({ length: count });
  return (
    <div style={{ display: "flex", flexDirection: type === "row" ? "column" : "row", gap: 16, flexWrap: "wrap", width: "100%" }}>
      {arr.map((_, i) => (
        <div key={i} className="glass-card animate-pulse" style={{
          padding: type === "stat" ? 24 : 24,
          flex: type === "card" || type === "stat" ? "1 1 200px" : "1 1 100%",
          display: "flex",
          flexDirection: type === "row" ? "row" : "column",
          gap: 16,
          alignItems: type === "row" ? "center" : "flex-start",
          minHeight: type === "card" ? 140 : type === "stat" ? 100 : 80
        }}>
          {type === "row" ? (
            <>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.05)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: "60%", height: 16, borderRadius: 4, background: "rgba(255,255,255,0.05)", marginBottom: 8 }} />
                <div style={{ width: "40%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
              </div>
              <div style={{ width: 80, height: 24, borderRadius: 12, background: "rgba(255,255,255,0.05)" }} />
            </>
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

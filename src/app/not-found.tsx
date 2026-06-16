import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: 96 }}>
      <div className="glass-card" style={{ padding: 60, textAlign: "center", maxWidth: 600, width: "100%" }}>
        <h1 style={{ fontSize: 100, fontWeight: 900, marginBottom: 10, background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>404</h1>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Page Not Found</h2>
        <p style={{ color: "#94a3b8", marginBottom: 40, fontSize: 16 }}>The trustless escrow you're looking for seems to have vanished into the void. It may have been completed, cancelled, or it never existed.</p>
        <Link href="/" className="btn btn-primary" style={{ padding: "14px 40px", fontSize: 16 }}>
          Return Home
        </Link>
      </div>
    </div>
  );
}

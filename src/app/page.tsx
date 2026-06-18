"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { CONTRACTS, DEPLOYER } from "@/lib/stacks";
import ThreeDLogo from "@/components/ThreeDLogo";

const FEATURES = [
  { icon: "🔒", title: "Trustless Escrow", desc: "Funds locked in Clarity smart contracts. No intermediary, no risk. Release only when milestones are verified on-chain." },
  { icon: "📊", title: "Milestone Payments", desc: "Split projects into milestones with automatic partial releases. Track progress transparently on the blockchain." },
  { icon: "⚖️", title: "Dispute Resolution", desc: "Decentralized arbitration by staked arbiters. Fair, transparent, and community-governed dispute handling." },
  { icon: "🏆", title: "On-Chain Reputation", desc: "Soul-bound reputation tokens track your reliability. Build trust through verified on-chain performance history." },
  { icon: "💎", title: "1% Protocol Fee", desc: "Minimal fees compared to 5-20% on centralized platforms. More earnings for providers, less cost for clients." },
  { icon: "₿", title: "Bitcoin Native", desc: "Built on Stacks, the leading Bitcoin L2. Settle on Bitcoin with the security of the most decentralized blockchain." },
];

const STATS = [
  { value: "$2.4M", label: "Total Volume Locked" },
  { value: "1,847", label: "Pacts Created" },
  { value: "98.2%", label: "Completion Rate" },
  { value: "342", label: "Active Builders" },
];

const STEPS = [
  { num: "01", title: "Create a Pact", desc: "Define your agreement with milestones, deadlines, and payment amounts. Both parties review and agree." },
  { num: "02", title: "Fund & Build", desc: "Client deposits STX into the smart contract. Provider starts work and submits deliverables per milestone." },
  { num: "03", title: "Review & Release", desc: "Client reviews deliverables. Approved milestones trigger automatic payment. Disputes go to arbitration." },
];

const DEPLOYED_CONTRACTS = [
  { name: CONTRACTS.PACT_CORE.name, fullId: `${DEPLOYER}.${CONTRACTS.PACT_CORE.name}`, desc: "Core escrow lifecycle — create, fund, release, cancel", lines: "300+" },
  { name: CONTRACTS.MILESTONE_ENGINE.name, fullId: `${DEPLOYER}.${CONTRACTS.MILESTONE_ENGINE.name}`, desc: "Milestone tracking with approval workflows", lines: "90+" },
  { name: CONTRACTS.ARBITER_DAO.name, fullId: `${DEPLOYER}.${CONTRACTS.ARBITER_DAO.name}`, desc: "Decentralized dispute resolution with staking", lines: "91+" },
  { name: CONTRACTS.REPUTATION_SBT.name, fullId: `${DEPLOYER}.${CONTRACTS.REPUTATION_SBT.name}`, desc: "Soul-bound reputation tokens & tiered scoring", lines: "84+" },
  { name: CONTRACTS.PACTFORGE_TOKEN.name, fullId: `${DEPLOYER}.${CONTRACTS.PACTFORGE_TOKEN.name}`, desc: "SIP-010 governance token (PFG)", lines: "102+" },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
        </div>
        
        {/* Event Banner */}
        <div style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 0", textAlign: "center" }}>
          <div className="container">
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>
              🚀 Built for the <span className="animated-gradient-text" style={{ fontSize: 14 }}>May Talent Stacks Builder Event</span>
            </span>
          </div>
        </div>

        <div className="container" style={{ marginTop: 40 }}>
          <div className={styles.heroContent}>
            {/* Left Content */}
            <div className={styles.heroLeft}>
              <div className="badge badge-primary animate-in" style={{ marginBottom: 20, fontSize: 13 }}>
                ⚡ Built on Stacks — Bitcoin L2
              </div>
              <h1 className={`${styles.heroTitle} animate-in animate-delay-1`}>
                Forge Trustless<br />
                <span className="animated-gradient-text">Agreements on Bitcoin</span>
              </h1>
              <p className={`${styles.heroSub} animate-in animate-delay-2`}>
                Decentralized escrow, milestone-based payments, and on-chain dispute resolution.
                Stop trusting. Start verifying.
              </p>
              <div className="animate-in animate-delay-3" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link href="/create-pact" className="btn btn-primary shimmer-btn" style={{ padding: "14px 32px", fontSize: 15 }}>
                  Create a Pact →
                </Link>
                <Link href="/dashboard" className="btn btn-secondary" style={{ padding: "14px 32px", fontSize: 15 }}>
                  View Dashboard
                </Link>
              </div>
            </div>

            {/* Right Content - 3D cartoon Bitcoin animation */}
            <div className="animate-in animate-delay-2" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <ThreeDLogo size={360} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "40px 0 80px" }}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <div key={i} className={`glass-card animate-in animate-delay-${i + 1}`} style={{ padding: 28, textAlign: "center" }}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>Features</div>
            <h2 className={styles.sectionTitle}>Why PactForge?</h2>
            <p className={styles.sectionSub}>Everything you need for trustless work agreements on Bitcoin.</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className="glass-card" style={{ padding: 32 }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="badge badge-success" style={{ marginBottom: 16 }}>How It Works</div>
            <h2 className={styles.sectionTitle}>Three Steps to Trustless</h2>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: 36, position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: -10, right: -10,
                  fontSize: 80, fontWeight: 900, color: "rgba(99,102,241,0.06)", lineHeight: 1,
                }}>{s.num}</div>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, color: "#6366f1", marginBottom: 20,
                  border: "1px solid rgba(99,102,241,0.2)",
                }}>{s.num}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployed Contracts */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="badge badge-warning" style={{ marginBottom: 16 }}>Live on Mainnet</div>
            <h2 className={styles.sectionTitle}>Deployed Smart Contracts</h2>
            <p className={styles.sectionSub}>Five auditable Clarity smart contracts live on Stacks mainnet.</p>
          </div>
          <div className={styles.contractsGrid}>
            {DEPLOYED_CONTRACTS.map((c, i) => (
              <a key={i} href={`https://explorer.hiro.so/txid/${c.fullId}?chain=mainnet`} target="_blank" rel="noopener noreferrer"
                className="glass-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16, textDecoration: "none", cursor: "pointer" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>📜</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{c.desc}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.fullId}</div>
                </div>
                <div className="badge badge-warning" style={{ fontSize: 11, flexShrink: 0 }}>{c.lines} lines</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 0 120px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="glass-card" style={{
            padding: "60px 40px", maxWidth: 700, margin: "0 auto",
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
            border: "1px solid rgba(99,102,241,0.15)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Background 3D Shield/Lock Animation */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <ThreeDLogo size={120} />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
              Ready to <span className="animated-gradient-text">Forge</span>?
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
              Create your first trustless agreement in minutes. Connect your Stacks wallet to get started.
            </p>
            <Link href="/create-pact" className="btn btn-primary shimmer-btn" style={{ padding: "16px 40px", fontSize: 16 }}>
              Launch App →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

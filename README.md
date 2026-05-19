# ⚡ PactForge Protocol

**Trustless Escrow & Milestone Payments on Bitcoin L2**

PactForge Protocol is a decentralized escrow, milestone-based payment, and dispute resolution platform built on [Stacks](https://www.stacks.co/) — the leading Bitcoin Layer 2. It eliminates the need for trusted intermediaries in freelance and contract work by leveraging Clarity smart contracts for transparent, on-chain agreement management.

> 🏆 Built for the **Stacks Builder Rewards May 2026** program.

---

## 🔗 Live Deployment

All smart contracts are **deployed and verified on Stacks Mainnet**:

| Contract | Deployed Address | Explorer |
|----------|-----------------|----------|
| **PactForge Token (PFG)** | `SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactforge` | [View →](https://explorer.hiro.so/txid/SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactforge?chain=mainnet) |
| **Pact Core (Escrow)** | `SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore` | [View →](https://explorer.hiro.so/txid/SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore?chain=mainnet) |
| **Milestone Engine** | `SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.milestone-v2` | [View →](https://explorer.hiro.so/txid/SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.milestone-v2?chain=mainnet) |
| **Arbiter DAO** | `SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.arbiter-dao-v4` | [View →](https://explorer.hiro.so/txid/SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.arbiter-dao-v4?chain=mainnet) |
| **Reputation SBT** | `SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.reputation-sbt-v2` | [View →](https://explorer.hiro.so/txid/SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.reputation-sbt-v2?chain=mainnet) |

---

## 🎯 Problem Statement

Freelancers and clients face a fundamental trust problem:

- **Clients** risk paying for work that's never delivered or is substandard
- **Providers** risk completing work and never receiving payment
- **Centralized platforms** charge 5-20% fees and act as biased intermediaries
- **No accountability** — bad actors can disappear without consequence

**PactForge solves this** by creating trustless, on-chain agreements where funds are locked in smart contracts, released only when milestones are verified, and disputes are resolved by a decentralized arbitration DAO.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 PactForge Frontend               │
│            Next.js 16 + @stacks/connect          │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Wallet   │  │ Dashboard │  │  Pact Creator │  │
│  │  Connect  │  │  & Stats  │  │  (Multi-step) │  │
│  └──────────┘  └──────────┘  └──────────────┘   │
│                                                   │
│  ┌──────────┐  ┌──────────┐                      │
│  │ Dispute  │  │Reputation│                      │
│  │ Arbiter  │  │ Profile  │                      │
│  └──────────┘  └──────────┘                      │
│                                                   │
├─────────────────────────────────────────────────┤
│              Stacks Blockchain (Bitcoin L2)        │
│                                                   │
│  ┌─────────────┐  ┌──────────────────┐           │
│  │ pactcore    │  │ milestone-v2     │           │
│  │ (Escrow)    │──│ (Milestone Mgmt) │           │
│  └─────────────┘  └──────────────────┘           │
│         │                                         │
│  ┌─────────────┐  ┌──────────────────┐           │
│  │arbiter-dao  │  │ reputation-sbt   │           │
│  │(Disputes)   │  │ (Soul-Bound Rep) │           │
│  └─────────────┘  └──────────────────┘           │
│                                                   │
│  ┌─────────────────────────────────────┐         │
│  │  pactforge (SIP-010 PFG Token)     │         │
│  └─────────────────────────────────────┘         │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## 📜 Smart Contracts

### 1. `pactcore` — Core Escrow Engine
The heart of PactForge. Manages the full lifecycle of escrow agreements:

- **Create Pact** — Define client, provider, amount, milestones, and deadline
- **Fund Pact** — Client deposits STX into the contract using `current-contract`
- **Accept Pact** — Provider confirms and activates the agreement
- **Release Payment** — Client approves milestone, funds transfer to provider via `as-contract?` with STX allowances
- **Cancel & Refund** — Automatic refund if pact is cancelled or deadline passes
- **Raise Dispute** — Either party can escalate to decentralized arbitration
- **Protocol Fee** — 1% (100 basis points) on releases, sent to treasury

### 2. `milestone-v2` — Milestone Engine
Manages milestone-based payment workflows with state machine transitions:

| State | Code | Description |
|-------|------|-------------|
| Pending | `u0` | Milestone created, waiting to start |
| In Progress | `u1` | Provider actively working |
| Submitted | `u2` | Deliverable submitted for review |
| Approved | `u3` | Client approved the deliverable |
| Rejected | `u4` | Client rejected, needs revision |
| Paid | `u5` | Payment released to provider |

- Supports up to **10 milestones per pact**
- Deliverable hashes stored on-chain (32-byte buff)
- Full audit trail with block timestamps

### 3. `arbiter-dao-v4` — Dispute Resolution DAO
Decentralized arbitration system where community members stake STX to become arbiters:

- **Stake to Register** — Arbiters stake 1 STX minimum to participate
- **Vote on Disputes** — Requires 3 votes for resolution
- **Resolution Outcomes** — Client wins, Provider wins, or Split
- **Performance Tracking** — Arbiter reputation tracked on-chain

### 4. `reputation-sbt-v2` — Soul-Bound Reputation
Non-transferable reputation tokens that track user reliability:

| Tier | Min Score | Badge |
|------|-----------|-------|
| Unranked | 0 | — |
| Bronze | 1 | 🥉 |
| Silver | 20 | 🥈 |
| Gold | 50 | 🥇 |
| Diamond | 100 | 💎 |

**Scoring:**
- Pact Completed: +10 points
- Milestone Delivered: +5 points
- Dispute Won: +3 points
- Dispute Lost: -5 points (with floor at 0)
- Arbiter Resolution: +2 points

### 5. `pactforge` — PFG Governance Token
SIP-010 compliant fungible token for protocol governance:

- **Max Supply:** 100,000,000 PFG (6 decimals)
- **Standard:** Full SIP-010 implementation
- **Functions:** Transfer, mint (owner-only), burn
- **Trait:** `SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard`

---

## 🖥️ Frontend

Built with **Next.js 16** (App Router) and a custom dark-mode design system:

### Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, deployed contracts |
| `/dashboard` | Real-time pact tracking, stats, and filtering |
| `/create-pact` | Multi-step pact creation wizard with milestones |
| `/disputes` | Dispute management and arbiter voting interface |
| `/reputation` | Tier progression, activity log, and leaderboard |

### Design System
- **Dark mode** with glassmorphism effects
- **Custom CSS** — no external UI libraries
- **Responsive** — mobile-first with adaptive layouts
- **Micro-animations** — hover effects, smooth transitions
- **Web3 native** — wallet connection state throughout

### Wallet Integration
- **@stacks/connect** for Leather wallet support
- Session persistence via localStorage
- Address display with shorten utility
- Connect/Disconnect flow

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- [Leather Wallet](https://leather.io/) browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/Earnwithalee7890/PactForge-Protocol.git
cd PactForge-Protocol

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
PactForge-Protocol/
├── contracts/                    # Clarity smart contracts
│   ├── pact-core.clar           # Core escrow engine
│   ├── milestone-engine.clar    # Milestone management
│   ├── arbiter-dao.clar         # Dispute resolution DAO
│   ├── reputation-sbt.clar      # Soul-bound reputation
│   └── pactforge-token.clar     # SIP-010 PFG token
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Landing page
│   │   ├── dashboard/           # Dashboard view
│   │   ├── create-pact/         # Pact creation wizard
│   │   ├── disputes/            # Dispute management
│   │   ├── reputation/          # Reputation profiles
│   │   ├── layout.tsx           # Root layout
│   │   ├── providers.tsx        # Client-side providers
│   │   └── globals.css          # Design system
│   ├── components/
│   │   └── Navbar.tsx           # Global navigation
│   ├── context/
│   │   └── WalletContext.tsx     # Wallet connection state
│   └── lib/
│       └── stacks.ts            # Contract addresses & helpers
├── public/
│   └── logo.png                 # PactForge logo
├── package.json
└── README.md
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Stacks (Bitcoin L2) |
| **Smart Contracts** | Clarity 4/5 |
| **Frontend** | Next.js 16 (App Router) |
| **Wallet** | @stacks/connect v8 |
| **SDK** | @stacks/transactions v7 |
| **Styling** | Vanilla CSS (custom design system) |
| **Deployment** | Stacks Mainnet |

---

## 🔐 Security

- **Clarity is decidable** — no reentrancy, no infinite loops, no runtime surprises
- **`as-contract?` with allowances** — Clarity 4 security model restricts asset outflows
- **`current-contract`** — Safe contract principal reference without context switching
- **Owner checks** — All admin functions gated by `contract-owner`
- **State machine** — Strict state transitions prevent invalid operations
- **Input validation** — All amounts, deadlines, and participants validated

---

## 🗺️ Roadmap

- [x] Core escrow smart contract
- [x] Milestone payment engine
- [x] Dispute resolution DAO
- [x] Soul-bound reputation system
- [x] SIP-010 governance token
- [x] Frontend with wallet integration
- [x] Mainnet deployment
- [ ] Multi-sig pact support
- [ ] Token-gated access tiers
- [ ] Cross-chain bridge (sBTC integration)
- [ ] Mobile-optimized PWA
- [ ] Automated milestone verification

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

---

<div align="center">

**Built with ❤️ on Stacks — Bitcoin L2**

[Website](https://pactforge.io) · [Explorer](https://explorer.hiro.so/txid/SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore?chain=mainnet) · [Stacks Builder Rewards](https://www.stacks.co/builder-rewards)

</div>

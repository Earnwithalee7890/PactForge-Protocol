import { Pact, Dispute, ReputationProfile, Milestone, MilestoneState, PactState } from "./types";

const INITIAL_PACTS: Pact[] = [
  {
    id: 1,
    title: "DeFi Dashboard UI/UX Design",
    description: "Complete redesign of the DeFi analytics dashboard with modern UI components.",
    client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    provider: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    totalAmount: "5,000 STX",
    fundedAmount: "5,000 STX",
    releasedAmount: "2,500 STX",
    state: "active",
    deadline: "2026-06-15",
    createdAt: "2026-05-01",
    milestones: [
      { id: 1, title: "Wireframes & Mockups", description: "Design wireframes for all pages", amount: "1,000 STX", state: 5 }, // Paid
      { id: 2, title: "Frontend Components", description: "Build React component library", amount: "1,500 STX", state: 5 }, // Paid
      { id: 3, title: "Integration & Testing", description: "Connect to smart contracts and test", amount: "1,500 STX", state: 1 }, // In Progress
      { id: 4, title: "Launch & Deployment", description: "Deploy to production", amount: "1,000 STX", state: 0 }, // Pending
    ]
  },
  {
    id: 2,
    title: "Smart Contract Audit",
    description: "Complete security audit for Pact Core Clarity contracts.",
    client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    provider: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    totalAmount: "3,200 STX",
    fundedAmount: "3,200 STX",
    releasedAmount: "3,200 STX",
    state: "completed",
    deadline: "2026-05-28",
    createdAt: "2026-05-10",
    milestones: [
      { id: 1, title: "Security Scan", description: "Run automated security scanners", amount: "1,200 STX", state: 3 }, // Approved/Paid
      { id: 2, title: "Manual Review", description: "Line by line code review", amount: "1,000 STX", state: 3 },
      { id: 3, title: "Final Report", description: "Deliver PDF audit report", amount: "1,000 STX", state: 3 }
    ]
  },
  {
    id: 3,
    title: "NFT Marketplace Backend",
    description: "Index API and metadata service for stacks nft standards.",
    client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    provider: "SP1QW8N305...",
    totalAmount: "8,500 STX",
    fundedAmount: "8,500 STX",
    releasedAmount: "0 STX",
    state: "funded",
    deadline: "2026-07-01",
    createdAt: "2026-06-01",
    milestones: [
      { id: 1, title: "Database Schema", description: "Database migrations and schemas", amount: "2,500 STX", state: 0 },
      { id: 2, title: "API Routes", description: "Implement CRUD endpoints", amount: "3,000 STX", state: 0 },
      { id: 3, title: "Integration", description: "Deploy api and connect front", amount: "3,000 STX", state: 0 }
    ]
  },
  {
    id: 4,
    title: "Token Bridge Integration",
    description: "Bridge ERC-20 tokens from Ethereum to SIP-010 Stacks.",
    client: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    provider: "SP4R...T6P",
    totalAmount: "12,000 STX",
    fundedAmount: "12,000 STX",
    releasedAmount: "2,000 STX",
    state: "disputed",
    deadline: "2026-06-20",
    createdAt: "2026-05-15",
    milestones: [
      { id: 1, title: "Bridge Smart Contracts", description: "Implement solidity contracts", amount: "2,000 STX", state: 5 },
      { id: 2, title: "Clarity Contracts", description: "Implement Stacks bridge end", amount: "4,000 STX", state: 1 },
      { id: 3, title: "Relayer Service", description: "Listen and relay events between chains", amount: "6,000 STX", state: 2 } // Submitted and disputed!
    ],
    disputeId: 1
  }
];

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 1,
    pactId: 4,
    title: "Relayer Service latency issues",
    reason: "The relayer service takes over 3 hours to process transactions, but the agreement states real-time bridging (under 10 minutes). The provider refuses to optimize it.",
    status: "open",
    votesClient: 3,
    votesProvider: 1,
    voters: ["SP11...", "SP22...", "SP33...", "SP44..."]
  }
];

const INITIAL_REPUTATION: Record<string, ReputationProfile> = {
  "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7": {
    address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    score: 95,
    completedPacts: 12,
    disputedPacts: 1,
    totalEarned: "0 STX"
  },
  "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE": {
    address: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    score: 87,
    completedPacts: 8,
    disputedPacts: 0,
    totalEarned: "12,400 STX"
  }
};

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getSafe<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setSafe<T>(key: string, value: T): void {
  if (isClient()) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const pactStore = {
  getPacts(): Pact[] {
    return getSafe("pactforge_pacts", INITIAL_PACTS);
  },

  getPactById(id: number): Pact | undefined {
    const pacts = this.getPacts();
    return pacts.find(p => p.id === id);
  },

  createPact(title: string, description: string, client: string, provider: string, totalAmount: string, milestones: Omit<Milestone, 'id' | 'state'>[]): Pact {
    const pacts = this.getPacts();
    const newId = pacts.length > 0 ? Math.max(...pacts.map(p => p.id)) + 1 : 1;
    
    const formattedMilestones: Milestone[] = milestones.map((m, idx) => ({
      id: idx + 1,
      title: m.title,
      description: m.description,
      amount: m.amount.includes("STX") ? m.amount : `${m.amount} STX`,
      state: 0 // Pending
    }));

    const newPact: Pact = {
      id: newId,
      title,
      description,
      client: client || "SP2J...MOCK",
      provider: provider || "SP3F...MOCK",
      totalAmount: totalAmount.includes("STX") ? totalAmount : `${totalAmount} STX`,
      fundedAmount: "0 STX",
      releasedAmount: "0 STX",
      state: "created",
      deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0], // 30 days
      createdAt: new Date().toISOString().split('T')[0],
      milestones: formattedMilestones
    };

    pacts.push(newPact);
    setSafe("pactforge_pacts", pacts);
    return newPact;
  },

  updatePact(updatedPact: Pact): void {
    const pacts = this.getPacts();
    const idx = pacts.findIndex(p => p.id === updatedPact.id);
    if (idx !== -1) {
      pacts[idx] = updatedPact;
      setSafe("pactforge_pacts", pacts);
    }
  },

  updateMilestoneState(pactId: number, milestoneId: number, newState: MilestoneState): Pact | undefined {
    const pact = this.getPactById(pactId);
    if (!pact) return undefined;

    const ms = pact.milestones.find(m => m.id === milestoneId);
    if (!ms) return pact;

    ms.state = newState;

    // Calculate changes to Pact state/releases
    if (newState === 5) {
      // Milestone paid, add to released amount
      const amountVal = parseFloat(ms.amount.replace(/[^0-9.]/g, ""));
      const currentReleased = parseFloat(pact.releasedAmount.replace(/[^0-9.]/g, "")) || 0;
      pact.releasedAmount = `${(currentReleased + amountVal).toLocaleString()} STX`;

      // If all milestones paid, mark pact as completed
      const allPaid = pact.milestones.every(m => m.state === 5 || m.state === 3);
      if (allPaid) {
        pact.state = "completed";
        this.updateReputation(pact.provider, 5, amountVal);
        this.updateReputation(pact.client, 2);
      }
    } else if (newState === 1) {
      pact.state = "active";
    }

    this.updatePact(pact);
    return pact;
  },

  reportMilestoneObstacle(pactId: number, milestoneId: number, obstacleDesc: string): Pact | undefined {
    const pact = this.getPactById(pactId);
    if (!pact) return undefined;
    const ms = pact.milestones.find(m => m.id === milestoneId);
    if (!ms) return pact;

    ms.obstacle = obstacleDesc;
    this.updatePact(pact);
    return pact;
  },

  clearMilestoneObstacle(pactId: number, milestoneId: number): Pact | undefined {
    const pact = this.getPactById(pactId);
    if (!pact) return undefined;
    const ms = pact.milestones.find(m => m.id === milestoneId);
    if (!ms) return pact;

    delete ms.obstacle;
    this.updatePact(pact);
    return pact;
  },

  raiseDispute(pactId: number, title: string, reason: string): Dispute | undefined {
    const pact = this.getPactById(pactId);
    if (!pact) return undefined;

    const disputes = getSafe("pactforge_disputes", INITIAL_DISPUTES);
    const newDisputeId = disputes.length > 0 ? Math.max(...disputes.map(d => d.id)) + 1 : 1;

    const newDispute: Dispute = {
      id: newDisputeId,
      pactId,
      title,
      reason,
      status: "open",
      votesClient: 0,
      votesProvider: 0,
      voters: []
    };

    disputes.push(newDispute);
    setSafe("pactforge_disputes", disputes);

    pact.state = "disputed";
    pact.disputeId = newDisputeId;
    this.updatePact(pact);

    // Penalize reputation for starting a dispute
    this.updateReputation(pact.client, -1);
    this.updateReputation(pact.provider, -2);

    return newDispute;
  },

  getDisputes(): Dispute[] {
    return getSafe("pactforge_disputes", INITIAL_DISPUTES);
  },

  voteDispute(disputeId: number, voteFor: "client" | "provider", voter: string): Dispute | undefined {
    const disputes = this.getDisputes();
    const dispute = disputes.find(d => d.id === disputeId);
    if (!dispute || dispute.status !== "open" || dispute.voters.includes(voter)) return dispute;

    dispute.voters.push(voter);
    if (voteFor === "client") {
      dispute.votesClient += 1;
    } else {
      dispute.votesProvider += 1;
    }

    // Auto resolve if total votes reaches 5 or more (simulated quorum)
    if (dispute.voters.length >= 5) {
      const winner = dispute.votesClient > dispute.votesProvider ? "client" : "provider";
      dispute.status = winner === "client" ? "resolved_client" : "resolved_provider";
      
      // Update Pact status based on resolution
      const pact = this.getPactById(dispute.pactId);
      if (pact) {
        if (winner === "client") {
          // Refund client remaining funded amount
          pact.state = "cancelled";
          this.updateReputation(pact.client, 5);
          this.updateReputation(pact.provider, -15);
        } else {
          // Release remaining to provider
          pact.state = "completed";
          const totalVal = parseFloat(pact.totalAmount.replace(/[^0-9.]/g, "")) || 0;
          const releasedVal = parseFloat(pact.releasedAmount.replace(/[^0-9.]/g, "")) || 0;
          pact.releasedAmount = pact.totalAmount;
          this.updateReputation(pact.provider, 10, totalVal - releasedVal);
          this.updateReputation(pact.client, -5);
        }
        this.updatePact(pact);
      }
    }

    setSafe("pactforge_disputes", disputes);
    return dispute;
  },

  getAllReputations(): ReputationProfile[] {
    const repMap = getSafe<Record<string, ReputationProfile>>("pactforge_reputation", INITIAL_REPUTATION);
    return Object.values(repMap);
  },

  getReputation(address: string): ReputationProfile {
    const repMap = getSafe<Record<string, ReputationProfile>>("pactforge_reputation", INITIAL_REPUTATION);
    if (!repMap[address]) {
      repMap[address] = {
        address,
        score: 100,
        completedPacts: 0,
        disputedPacts: 0,
        totalEarned: "0 STX"
      };
      setSafe("pactforge_reputation", repMap);
    }
    return repMap[address];
  },

  updateReputation(address: string, scoreChange: number, stxEarnedChange = 0): void {
    const repMap = getSafe<Record<string, ReputationProfile>>("pactforge_reputation", INITIAL_REPUTATION);
    if (!repMap[address]) {
      repMap[address] = {
        address,
        score: 100,
        completedPacts: 0,
        disputedPacts: 0,
        totalEarned: "0 STX"
      };
    }

    const rep = repMap[address];
    rep.score = Math.max(0, Math.min(100, rep.score + scoreChange));
    
    if (scoreChange > 0 && stxEarnedChange > 0) {
      rep.completedPacts += 1;
    } else if (scoreChange < -5) {
      rep.disputedPacts += 1;
    }

    if (stxEarnedChange > 0) {
      const currentEarned = parseFloat(rep.totalEarned.replace(/[^0-9.]/g, "")) || 0;
      rep.totalEarned = `${(currentEarned + stxEarnedChange).toLocaleString()} STX`;
    }

    repMap[address] = rep;
    setSafe("pactforge_reputation", repMap);
  }
};
